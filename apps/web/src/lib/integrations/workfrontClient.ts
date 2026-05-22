// Thin client for the Adobe Workfront REST API (/attask/api).
// Workfront search endpoints page via $$FIRST / $$LIMIT and return { data: [...] }.

export interface WorkfrontClientConfig {
  baseUrl: string
  apiVersion: string
  apiKey: string
}

// Maps the connector's object codes to Workfront search endpoint slugs.
export const WF_ENDPOINT: Record<string, string> = {
  PROJ: 'proj',
  TASK: 'task',
  OPTASK: 'optask',
  ASSGN: 'assgn',
  USER: 'user',
  HOUR: 'hour',
  PORTFOLIO: 'port',
  PROGRAM: 'prgm',
  TEAM: 'teamob',
  GROUP: 'group',
  DOCUMENT: 'docu',
  NOTE: 'note',
  EXPENSE: 'expense',
  RISK: 'risk',
}

const PAGE_SIZE = 200
const MAX_PAGES = 50
const REQUEST_TIMEOUT_MS = 30_000

function buildBase(cfg: WorkfrontClientConfig): string {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  return `${base}/attask/api/${cfg.apiVersion}`
}

async function wfFetch(url: string): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      const errObj = json.error as { message?: string } | undefined
      throw new Error(errObj?.message ?? `Workfront responded ${res.status}`)
    }
    return json
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Workfront request timed out')
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

// Lightweight connectivity probe used by the "Test" button.
export async function testWorkfrontConnection(
  cfg: WorkfrontClientConfig
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const started = Date.now()
  const url = `${buildBase(cfg)}/user/search?apiKey=${encodeURIComponent(cfg.apiKey)}&$$LIMIT=1`
  try {
    await wfFetch(url)
    return { success: true, message: 'Connection successful', latencyMs: Date.now() - started }
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Connection failed',
      latencyMs: Date.now() - started,
    }
  }
}

// Fetches every record for one Workfront object type, paging until exhausted.
export async function fetchAllRecords(
  cfg: WorkfrontClientConfig,
  objectCode: string,
  fields = '*'
): Promise<Record<string, unknown>[]> {
  const endpoint = WF_ENDPOINT[objectCode]
  if (!endpoint) throw new Error(`Unsupported Workfront object code: ${objectCode}`)

  const base = buildBase(cfg)
  const out: Record<string, unknown>[] = []

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `${base}/${endpoint}/search?apiKey=${encodeURIComponent(cfg.apiKey)}` +
      `&fields=${encodeURIComponent(fields)}` +
      `&$$LIMIT=${PAGE_SIZE}&$$FIRST=${page * PAGE_SIZE}`
    const json = await wfFetch(url)
    const data = Array.isArray(json.data) ? (json.data as Record<string, unknown>[]) : []
    out.push(...data)
    if (data.length < PAGE_SIZE) break
  }

  return out
}
