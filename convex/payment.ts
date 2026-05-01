import { action, query, internalMutation, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""
const PAYSTACK_BASE_URL = "https://api.paystack.co"
const SITE_URL = process.env.CONVEX_SITE_URL || ""

async function callPaystackApi(endpoint: string, method: string, body?: object) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

function getPlanCode(plan: "monthly" | "annual"): string {
  return plan === "monthly" ? "PLN_monthly" : "PLN_annual"
}

function getPlanAmount(plan: "monthly" | "annual"): number {
  return plan === "monthly" ? 150000 : 1500000
}

export const createPlans = action({
  args: {},
  handler: async () => {
    if (!PAYSTACK_SECRET_KEY) {
      return { success: false, error: "Paystack not configured" }
    }

    try {
      const monthlyResult = await callPaystackApi("/plan", "POST", {
        name: "Premium Monthly",
        amount: 150000,
        interval: "monthly",
        description: "Monthly premium access to all lessons and exams",
      })

      const annualResult = await callPaystackApi("/plan", "POST", {
        name: "Premium Annual",
        amount: 1500000,
        interval: "annually",
        description: "Annual premium access to all lessons and exams",
      })

      return {
        success: true,
        monthly: monthlyResult.data,
        annual: annualResult.data,
      }
    } catch (error) {
      return { success: false, error: "Failed to create plans" }
    }
  },
})

export const initializeSubscription = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
  },
  handler: async (_ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      console.log("DEBUG - PAYSTACK_SECRET_KEY: UNDEFINED")
      console.log("DEBUG - SITE_URL:", SITE_URL)
      return { success: false, error: "Payment not configured" }
    }

    console.log("DEBUG - PAYSTACK_SECRET_KEY: SET")
    console.log("DEBUG - SITE_URL:", SITE_URL)
    console.log("DEBUG - plan being initialized:", args.plan)

    const planCode = getPlanCode(args.plan)
    const reference = `prepwise_${args.userId}_${Date.now()}`

    try {
      const result = await callPaystackApi("/transaction/initialize", "POST", {
        email: args.email,
        amount: getPlanAmount(args.plan),
        reference,
        callback_url: `${SITE_URL}/payment-callback`,
        plan: planCode,
        metadata: {
          userId: args.userId,
          plan: args.plan,
        },
      })

      if (result.status) {
        return {
          success: true,
          authorizationUrl: result.data.authorization_url,
          reference,
        }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.log("PAYSTACK ERROR:", error)
      console.log("Request details:", {
        email: args.email,
        amount: getPlanAmount(args.plan),
        reference,
        callback_url: `${SITE_URL}/payment-callback`,
        plan: planCode,
      })
      return { success: false, error: "Failed to initialize payment" }
    }
  },
})

export const verifyPayment = action({
  args: {
    userId: v.id("users"),
    reference: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
  },
  handler: async (ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      return { success: false, error: "Payment not configured" }
    }

    try {
      const result = await callPaystackApi(`/transaction/verify/${args.reference}`, "GET")

      if (result.status && result.data.status === "success") {
        const data = result.data
        const customerCode = data.customer?.code || `CUS_${args.userId}`
        const authorizationCode = data.authorization?.authorization_code || data.authorization_code

        const subscriptionCode = data.subscription?.id || data.subscription_code
        const nextPaymentDate = data.subscription?.next_payment_date
          ? new Date(data.subscription.next_payment_date).getTime()
          : (args.plan === "monthly"
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : Date.now() + 365 * 24 * 60 * 60 * 1000)

        await ctx.runMutation(internal.payment.createSubscriptionRecord, {
          userId: args.userId,
          customerCode,
          authorizationCode,
          subscriptionCode: subscriptionCode || "",
          plan: args.plan,
          nextPaymentDate,
        })

        return { success: true }
      } else {
        return { success: false, error: "Payment not confirmed" }
      }
    } catch (error) {
      return { success: false, error: "Verification failed" }
    }
  },
})

export const cancelSubscription = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      return { success: false, error: "Payment not configured" }
    }

    const subscription = await ctx.runQuery(internal.payment.getUserSubscription, {
      userId: args.userId,
    })

    if (!subscription || subscription.status !== "active") {
      return { success: false, error: "No active subscription found" }
    }

    try {
      await callPaystackApi("/subscription/disable", "POST", {
        code: subscription.subscriptionCode,
        email: "user@example.com",
      })

      await ctx.runMutation(internal.payment.cancelSubscriptionRecord, {
        userId: args.userId,
        subscriptionId: subscription._id,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to cancel subscription" }
    }
  },
})

export const getSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first()

    if (!subscription) {
      return { status: "free", plan: null }
    }

    const isActive = subscription.status === "active" && subscription.nextPaymentDate > Date.now()
    return {
      status: isActive ? "premium" : "expired",
      plan: subscription.plan,
      subscriptionCode: subscription.subscriptionCode,
      nextPaymentDate: subscription.nextPaymentDate,
    }
  },
})

export const createSubscriptionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    customerCode: v.string(),
    authorizationCode: v.string(),
    subscriptionCode: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
    nextPaymentDate: v.number(),
  },
  handler: async (ctx, args) => {
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      subscriptionCode: args.subscriptionCode,
      customerCode: args.customerCode,
      planCode: getPlanCode(args.plan),
      plan: args.plan,
      status: "active",
      authorizationCode: args.authorizationCode,
      nextPaymentDate: args.nextPaymentDate,
      startDate: Date.now(),
    })

    await ctx.db.patch(args.userId, {
      subscriptionStatus: "premium",
    })

    return subscriptionId
  },
})

export const cancelSubscriptionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      status: "cancelled",
    })

    await ctx.db.patch(args.userId, {
      subscriptionStatus: "free",
    })

    return { success: true }
  },
})

export const getUserSubscription = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first()
  },
})

export const handleWebhookEvent = internalMutation({
  args: {
    event: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { event, data } = args

    switch (event) {
      case "subscription.create": {
        const subscriptionCode = data.subscription?.code
        if (subscriptionCode) {
          const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("subscriptionCode", (q) => q.eq("subscriptionCode", subscriptionCode))
            .first()
          if (subscription) {
            await ctx.db.patch(subscription._id, {
              status: "active",
              nextPaymentDate: new Date(data.subscription.next_payment_date).getTime(),
            })
          }
        }
        break
      }

      case "subscription.disable": {
        const subscriptionCode = data.subscription_code
        if (subscriptionCode) {
          const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("subscriptionCode", (q) => q.eq("subscriptionCode", subscriptionCode))
            .first()
          if (subscription) {
            await ctx.db.patch(subscription._id, {
              status: "cancelled",
            })
            await ctx.db.patch(subscription.userId, {
              subscriptionStatus: "free",
            })
          }
        }
        break
      }

      case "charge.failed": {
        const customerCode = data.customer?.code
        if (customerCode) {
          const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("customerCode", (q) => q.eq("customerCode", customerCode))
            .first()
          if (subscription) {
            await ctx.db.patch(subscription._id, {
              status: "expired",
            })
            await ctx.db.patch(subscription.userId, {
              subscriptionStatus: "free",
            })
          }
        }
        break
      }
    }

    return { success: true }
  },
})