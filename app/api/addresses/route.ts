import { NextResponse } from "next/server";
import { createAddress, getAddresses, type CreateAddressInput } from "@/lib/swiggy/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ addresses: await getAddresses() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load saved addresses.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateAddressInput;
    if (!input.fullAddress || !input.userName || !input.userPhone || !input.addressCategory) {
      return NextResponse.json({ error: "Complete address, name, phone, and address type are required." }, { status: 400 });
    }
    return NextResponse.json({ address: await createAddress(input) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save this address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
