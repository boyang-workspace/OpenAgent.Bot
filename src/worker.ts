import { handle } from "@astrojs/cloudflare/handler";
import { runAnalyticsRollup } from "@/lib/analytics/rollup";

export default {
  fetch(request: Request, environment: Env, context: ExecutionContext) {
    return handle(request, environment, context);
  },
  async scheduled(_controller: ScheduledController, environment: Env, context: ExecutionContext) {
    context.waitUntil(runAnalyticsRollup(environment));
  }
};
