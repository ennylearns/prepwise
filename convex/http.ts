import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

const http = httpRouter()

http.route({
  path: "/webhooks/paystack",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const bodyStr = await req.text()

    try {
      const body = JSON.parse(bodyStr)
      const event = body.event

      await ctx.runMutation(internal.payment.handleWebhookEvent, {
        event,
        data: body.data,
      })

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  }),
})

export default http