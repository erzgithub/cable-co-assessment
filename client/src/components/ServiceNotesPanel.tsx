import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type Note = {
  id: number;
  content: string;
  authorName: string | null;
  createdAt: Date;
};

type Props = {
  serviceRequestId: number;
};

export function ServiceNotesPanel({ serviceRequestId }: Props){
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
      utils.serviceNotes.list.invalidate({ serviceRequestId });
    },
  });

  if (error) {
    return (
      <Card className="mt-4 border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">
            Failed to load notes: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading notes...</p>;
  }

  const notes: Note[] = data?.notes ?? [];

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
            {notes.map((note: Note) => (
              <div
                key={note.id}
                className="border rounded p-2 text-sm flex justify-between items-start"
              >
                <div>
                  {note.authorName && (
                    <p className="text-xs font-medium">
                      {note.authorName}
                    </p>
                  )}
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