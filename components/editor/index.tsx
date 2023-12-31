"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { JSONContent } from '@tiptap/core'
import { TiptapEditorProps } from "./props";
import { EDITOR_CHARACTER_LIMIT, TiptapExtensions } from "./extensions";
import { useDebouncedCallback } from "use-debounce";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import va from "@vercel/analytics";
import { EditorBubbleMenu } from "./components/bubble-menu";
import { getCharacterCount, getPrevText } from "@/lib/editor";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { DownloadDraft } from "@/components/download-draft";
import { Preset } from "@/lib/presets";
import { ChatToggle } from "@/components/chat-toggle";
import { Badge } from "@/components/ui/badge";


type EditorProps = {
  className?: string;
  preset?: Preset;
  content?: JSONContent;
  setContent: (content: JSONContent) => void;
  setIsChatOpen: (isChatOpen: boolean) => void;
  isChatOpen: boolean;
};

export default function Editor({
  className,
  content,
  setContent, 
  preset,
  setIsChatOpen,
  isChatOpen,
}: EditorProps) {
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [hydrated, setHydrated] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON();
    setSaveStatus("Saving...");
    setContent(json);
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  }, 750);

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus("Unsaved");
      const selection = e.editor.state.selection;
      const lastTwo = getPrevText(e.editor, {
        chars: 2,
      });
      if (lastTwo === "++" && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(
          getPrevText(e.editor, {
            chars: 5000,
          }),
        );
        // complete(e.editor.storage.markdown.getMarkdown());
        va.track("Autocomplete Shortcut Used");
      } else {
        debouncedUpdates(e);
      }
    },
    autofocus: "end",
  });

  const { complete, completion, isLoading, stop } = useCompletion({
    id: "autocomplete",
    api: "/api/generate",
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: (err) => {
      toast.error(err.message);
      if (err.message === "You have reached your request limit for the day.") {
        va.track("Rate Limit Reached");
      }
    },
  });

  const prev = useRef("");

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff);
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
        stop();
        if (e.key === "Escape") {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent("++");
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm("AI writing paused. Continue?")) {
        complete(editor?.getText() || "");
      }
    };
    if (isLoading) {
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", mousedownHandler);
    } else {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content);
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  console.log('editor?.storage?.characterCount?.characters()', editor?.getCharacterCount())

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
        
      }}
      className={cn("relative min-h-screen w-full max-w-screen border-border bg-background p-12 px-8 sm:rounded-r-2xl sm:border sm:shadow-lg", className)}
    >
      <div className="absolute right-5 top-5 flex flex-row space-x-1 items-center">
        <Button disabled={true} size="sm" variant="ghost">
          {saveStatus}
        </Button>
        {editor && <DownloadDraft content={editor?.getHTML()} />}
        <ChatToggle setIsChatOpen={setIsChatOpen}  isChatOpen={isChatOpen} />
      </div>
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent  editor={editor} className="mt-10" />
      {editor && <Badge variant="secondary"  className='text-secondary-foreground/60 absolute bottom-2 left-2'>
        {getCharacterCount(editor)}
      </Badge>}
    </div>
  );
}
