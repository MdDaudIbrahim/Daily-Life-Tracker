import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Clock, X } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 1,
        title: 'Meeting Notes',
        content: 'Discuss project timeline and deliverables',
        category: 'Work',
        date: '2024-02-20'
      },
      {
        id: 2,
        title: 'Shopping List',
        content: 'Groceries and household items',
        category: 'Personal',
        date: '2024-02-19'
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'Personal'
  });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const categories = ['Personal', 'Work', 'Ideas', 'Tasks', 'Other'];

  // Add this useEffect to save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

    if (editingNoteId) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNoteId ? {
          ...note,
          title: newNote.title,
          content: newNote.content,
          category: newNote.category
        } : note
      ));
    } else {
      // Create new note
      const note = {
        id: Date.now(),
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        date: new Date().toISOString().split('T')[0]
      };
      setNotes([note, ...notes]);
    }

    setIsModalOpen(false);
    setNewNote({ title: '', content: '', category: 'Personal' });
    setEditingNoteId(null);
  };

  const handleEdit = (note: typeof notes[0]) => {
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setEditingNoteId(note.id);
    setIsModalOpen(true);
  };

  const handleDelete = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>New Note</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.536 1.414 1.414-3.536 8.793-8.793z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 hover:bg-red-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 9.586L4.293 3.879 3.879 4.293 9.586 10l-5.707 5.707 0.414 0.414L10 10.414l5.707 5.707 0.414-0.414L10 9.586z" />
                  </svg>
                </button>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {note.category}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              <span>{note.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNoteId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Write your note here..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                {editingNoteId ? 'Save Changes' : 'Create Note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;