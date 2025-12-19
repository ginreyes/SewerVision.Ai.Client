"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import qcApi from "@/data/qcApi";

const QCNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const notesData = await qcApi.getNotes(userId, { isArchived: false });
      setNotes(notesData || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showAlert(error.message || "Failed to load notes", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, showAlert]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      showAlert("Please fill in both title and content", "error");
      return;
    }

    try {
      if (editingNote) {
        await qcApi.updateNote(editingNote._id || editingNote.id, {
          userId,
          title: noteTitle,
          content: noteContent
        });
        showAlert("Note updated successfully", "success");
      } else {
        await qcApi.createNote({
          userId,
          title: noteTitle,
          content: noteContent
        });
        showAlert("Note created successfully", "success");
      }
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      showAlert(error.message || "Failed to save note", "error");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await qcApi.deleteNote(noteId, userId);
      showAlert("Note deleted successfully", "success");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      showAlert(error.message || "Failed to delete note", "error");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setEditingNote(null);
    setShowAddForm(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notes</h1>
          <p className="text-gray-600">Keep track of your QC review notes and observations</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? "Cancel" : "New Note"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingNote ? "Edit Note" : "New Note"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveNote}>
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">Loading notes...</div>
          </CardContent>
        </Card>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No notes yet. Create your first note!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const noteId = note._id || note.id;
            return (
              <Card key={noteId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(noteId)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{note.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QCNotesPage;

