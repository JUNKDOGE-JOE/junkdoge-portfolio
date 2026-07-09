# Live GitHub Star Count Design

## Goal

Replace the hard-coded ae-mcp star count in the portfolio with the current GitHub star count fetched once when the portfolio opens.

## Scope

- Remove the hard-coded `⭐22` suffix from the ae-mcp project description.
- Discover GitHub-backed projects from their existing `links.github` values.
- Request each unique public repository once during the initial home-carousel mount.
- Read `stargazers_count` from GitHub's repository REST response.
- Display the value next to the matching project's description.
- Do not poll, authenticate, persist, or modify unrelated project content.

## Architecture

A small GitHub utility parses a repository URL and fetches its current star count. A client-side hook runs once for the home carousel's project list, deduplicates repository URLs, and stores successful results in memory. `CarouselRoot` passes the matching count into `Slide`, which renders it only after a successful response.

This keeps network behavior outside the project data file and avoids embedding credentials in the browser bundle.

## Data Flow

1. `CarouselRoot` mounts with the featured project list.
2. The star-count hook finds projects with `links.github`.
3. It fetches `https://api.github.com/repos/{owner}/{repo}` once per unique repository.
4. Successful numeric `stargazers_count` values are stored by project slug.
5. The active `Slide` receives an optional count and renders `⭐{count}`.
6. A failed, aborted, or malformed response leaves the count absent.

## Error Handling

- API errors never block the carousel.
- No stale hard-coded number is shown as a fallback.
- In-flight requests are ignored after unmount.
- No retry or polling is performed.

## Testing

Tests will be written before production code and will cover:

- parsing a valid GitHub repository URL;
- rejecting unsupported or malformed URLs;
- returning a numeric `stargazers_count` from a successful response;
- returning no count for failed or malformed responses;
- rendering the live count when supplied and omitting it otherwise;
- confirming the request effect does not poll.

## Non-goals

- GitHub authentication or tokens;
- server-side rendering or a Next.js API route;
- build-time star snapshots;
- live push updates after the initial request;
- changes to profile metadata, other projects, or visual design.
