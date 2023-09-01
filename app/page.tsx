import { Metadata } from "next"
import { ContractPlayground } from "@/components/contract-playground"

export const metadata: Metadata = {
  title: "Playground",
  description: "The OpenAI Playground built using the components.",
}

export default function PlaygroundPage({
  params,
  searchParams,
}: {
  params: { presetId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <ContractPlayground  />
}