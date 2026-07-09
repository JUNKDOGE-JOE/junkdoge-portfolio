import { describe, expect, it, vi } from 'vitest'
import { fetchGitHubStarCount } from './github'

describe('fetchGitHubStarCount', () => {
  it('reads the current star count from a GitHub repository URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stargazers_count: 24 }),
    })

    const count = await fetchGitHubStarCount(
      'https://github.com/JUNKDOGE-JOE/after-effects-mcp',
      { fetcher },
    )

    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.github.com/repos/JUNKDOGE-JOE/after-effects-mcp',
      expect.objectContaining({ headers: { Accept: 'application/vnd.github+json' } }),
    )
    expect(count).toBe(24)
  })

  it('returns null when GitHub cannot provide a valid count', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false })

    await expect(fetchGitHubStarCount('https://github.com/owner/repo', { fetcher }))
      .resolves.toBeNull()
    await expect(fetchGitHubStarCount('https://example.com/owner/repo', { fetcher }))
      .resolves.toBeNull()
  })
})
