import axios from "axios";

type FetchResponse = {
  body?: string;
  error?: Error;
};

export async function fetch(url: string): Promise<FetchResponse> {
  const response = await axios({
    url,
    method: "get",
    responseType: "document",
  });

  if (response.status === 200) {
    return {
      body: response.data,
    };
  }

  return {
    error: new Error(`failed to fetch: ${url}`),
  };
}
