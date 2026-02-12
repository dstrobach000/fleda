const SANITY_API_VERSION = "2023-10-01";

type SanityPerspective = "published" | "previewDrafts";

type QueryOptions = {
  token?: string;
  perspective?: SanityPerspective;
  revalidate?: number;
};

function getSanityBaseUrl() {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "rw346rj2";
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  return {
    projectId,
    dataset,
    baseUrl: `https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}`,
  };
}

export async function sanityQuery<T>(query: string, options: QueryOptions = {}): Promise<T> {
  const {baseUrl, dataset} = getSanityBaseUrl();
  const search = new URLSearchParams();
  search.set("query", query);

  if (options.perspective) {
    search.set("perspective", options.perspective);
  }

  const res = await fetch(`${baseUrl}/data/query/${dataset}?${search.toString()}`, {
    method: "GET",
    headers: options.token ? {Authorization: `Bearer ${options.token}`} : undefined,
    next: {revalidate: options.revalidate ?? 60},
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sanity query failed (${res.status}): ${body}`);
  }

  const payload = (await res.json()) as {result: T};
  return payload.result;
}

export async function sanityMutate(
  mutations: unknown[],
  options: {token?: string} = {}
): Promise<{transactionId?: string}> {
  if (mutations.length === 0) {
    return {};
  }

  const token = options.token || process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing SANITY_API_WRITE_TOKEN for Sanity mutations.");
  }

  const {baseUrl, dataset} = getSanityBaseUrl();
  const res = await fetch(`${baseUrl}/data/mutate/${dataset}?returnIds=true&returnDocuments=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({mutations}),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sanity mutate failed (${res.status}): ${body}`);
  }

  const payload = (await res.json()) as {transactionId?: string};
  return payload;
}
