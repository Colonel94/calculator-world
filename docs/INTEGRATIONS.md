# Central advertising and analytics preparation

Neither service is active. There are no ad/analytics requests, tracking storage or collected calculation inputs.

## AdSense

The shared generator emits hidden positions on every calculator:

- `[data-ad-position="afterResult"]`: after the whole calculator and its result.
- `[data-ad-position="afterExplanation"]`: after the method, example and assumptions.

These are markup integration points, not visible empty ad boxes. Future implementation belongs in **src/integrations.mjs**, once for all pages. Put a genuine publisher ID in **src/config.mjs → advertising.publisherId**, with real slot IDs in `advertising.slots.afterResult` and `advertising.slots.afterExplanation`. Keep `enabled: false` until ready.

Activation requires adding the genuine AdSense loader and slot code, reviewing current publisher requirements, providing the consent mechanism applicable to served regions, updating privacy disclosures and testing mobile layout. Set dimensions before showing slots to limit layout shift. Keep ads outside forms and away from Calculate/Reset. Add any required ads.txt with actual publisher information at the effective domain root; this repository’s subdirectory is not that root.

Changing enabled alone does not activate ads. This release intentionally has no ad loader or publisher account information.

## Analytics

Put a real GA4 ID in **src/config.mjs → analytics.measurementId**. Implement a consent-aware adapter in **src/integrations.mjs** to initialize GA only when appropriate, send the current static page URL as a page view, and subscribe to the existing browser event hook. Then enable the setting.

| Event | Allowed parameters | Purpose |
| --- | --- | --- |
| calculator_use | calculator_id | Explicit Calculate submissions |
| search | result_count | Search use without collecting the query |
| related_calculator_click | calculator_id, target | Discovery between tools |

When enabled and given an ID, `track()` dispatches these as `cw:analytics` custom events; it does not itself contact Google. The adapter must apply consent before forwarding. Do not send input amounts, birth dates, health measurements, raw searches or form contents. Live recalculation is not counted as repeated explicit usage.

Before activation, revise Privacy to describe actual services, data uses, user choices and retention. Review [Google’s required AdSense privacy content](https://support.google.com/adsense/answer/1348695) and current consent requirements. Present wording accurately states that services are inactive.
