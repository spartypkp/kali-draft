'use client'
import React from "react"

import { PresetSelector } from "@/components/preset-selector"
import {  Model } from "@/lib/models"
import { presets, Preset } from "@/lib/presets"
import Editor from "./editor"
import { SettingsDialog } from "./settings-dialog"
import useLocalStorage from '@/hooks/use-local-storage'
import { DocChat } from "./doc-chat"
import DEFAULT_EDITOR_CONTENT from "@/components/editor/default-content";
import { JSONContent } from "@tiptap/core"

interface ContractPlaygroundProps {
    preset?: Preset,
    model?: Model,
}

export const ContractPlayground = ({
    preset,
    model
}: ContractPlaygroundProps) => {
    const [content, setContent] = useLocalStorage(
      "content",
      preset ? preset.content : DEFAULT_EDITOR_CONTENT,
    ); 

    return (
      <div className='w-screen min-h-screen grid grid-cols-5 space-y-0'>
        {/* <div className="flex flex-col justify-center md:hidden">
          <p className="mx-5 text-3xl bg-foreground text-background p-2">
            👉 Contract playground is not mobile friendly yet. Please use a desktop browser.
          </p>
        </div> */}
        {/* <div className="hidden md:flex container flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16"> */}
          {/* <h2 className="text-lg font-semibold flex flex-row space-x-1"><span>✍🏼</span><span>Draft</span></h2> */}
          {/* <div className="ml-auto flex w-full space-x-2 sm:justify-end">
            <PresetSelector presets={presets} preset={preset} />
            <PresetSave />
            <div className="hidden space-x-2 md:flex">
              <PresetShare />
            </div>
            <PresetActions />
          </div> */}
           {/* <ContractForm preset={preset} /> */}
        {/* </div> */}
            
            <Editor preset={preset} setContent={setContent as (content: JSONContent) => void} content={content as JSONContent} className="col-span-3 w-full min-h-screen p-4 m-0" /> 
            <div className="col-span-2 h-full m-0 pt-1">
              <div className="w-full flex flex-row justify-between">
                <PresetSelector presets={presets} preset={preset} />
                {/* <PresetSave />
                <PresetShare />  */}
                <SettingsDialog />
              </div>
              {/* <Separator className='' /> */}
              <DocChat content={content as JSONContent} />
            </div>
          </div>
    )};