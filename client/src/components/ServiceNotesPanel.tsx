import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type Props = {
  serviceRequestId: number;
};

export function serviceNotesPanel({ serviceRequestId }: Props){
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");

  const {data, isLoading, error} = trpc.serviceNotes.list.useQuery({ serviceRequestId });

  const addNote = trpc.serviceNotes.add.useMutation({
    onSuccess: () => {
      setContent("");
      utils.serviceNotes.list.invalidate({ serviceRequestId });
    },
  });

  const deleteNote = trpc.serviceNotes.delete.useMutation({
    onSuccess: () => {
      setContent("");
      utils.serviceNotes.list.invalidate({ serviceRequestId });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading notes...</p>;
  }

  const notes = data?.notes ?? [];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-md">Internal Notes</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Textarea
            placeholder="Write a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() =>
              addNote.mutate({ serviceRequestId, content: content.trim() })
            }
            disabled={addNote.isPending || content.trim().length === 0}
          >
            Add Note
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes yet.
          </p>
        ) : (
          <div className="space-y-2">
            {notes.map((note: any) => (
              <div
                key={note.id}
                className="border rounded p-2 text-sm flex justify-between items-start"
              >
                <div>
                  <p>{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    deleteNote.mutate({ noteId: note.id })
                  }
                  disabled={deleteNote.isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}