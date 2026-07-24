import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

type LegacyHandler = (req: NextApiRequest, res: NextApiResponse) => unknown;

export const adaptNextApi = (handler: LegacyHandler) => async (request: NextRequest) => {
  let statusCode = 200;
  let responseBody: unknown;
  let ended = false;

  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.json().catch(() => ({}));
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(value: unknown) {
      responseBody = value;
      ended = true;
      return response;
    },
    end(value?: unknown) {
      responseBody = value;
      ended = true;
      return response;
    },
    async revalidate() {},
  } as unknown as NextApiResponse;

  const req = {
    method: request.method,
    body,
    query,
    headers: Object.fromEntries(request.headers.entries()),
  } as unknown as NextApiRequest;

  await handler(req, response);

  if (!ended || responseBody === undefined) {
    return new NextResponse(null, { status: statusCode });
  }

  return NextResponse.json(responseBody, { status: statusCode });
};
