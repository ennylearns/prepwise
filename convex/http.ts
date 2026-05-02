import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

const http = httpRouter()

http.route({
  path: "/webhooks/paystack",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const bodyStr = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.log("DEBUG: WEBHOOK - No secret key configured")
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = JSON.parse(bodyStr)
    const event = body.event

    console.log("DEBUG: WEBHOOK received:", event)

    try {
      await ctx.runMutation(internal.payment.handleWebhookEvent, {
        event,
        data: body.data,
      })

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.log("DEBUG: WEBHOOK error:", error)
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  }),
})

export default http