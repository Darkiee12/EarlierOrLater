import { NextResponse } from 'next/server';
import Result from '@/common/result';
import EventDateImpl from '@/models/eventdate';
import axios from 'axios';
import { FullEvent } from '@/models/event';
const _apiBaseUrl = process.env.API?.trim();
if (!_apiBaseUrl) {
  throw new Error('Missing API base URL configuration');
}
const apiBaseUrl = new URL(_apiBaseUrl);

export async function POST(request: Request) {
  const result = EventDateImpl.fromJSON(await request.json());
  return result.match({
    Ok: async (eventDate) => {
      apiBaseUrl.pathname = `/api/${eventDate.month}/${eventDate.date}`;
      const response = await axios.get<FullEvent>(apiBaseUrl.toString());
      return NextResponse.json(response.data);
    },
    Err: (error) => {
      console.error(error);
      return NextResponse.json(Result.Err('Invalid request body'), { status: 400 });
    }
  })  
}
