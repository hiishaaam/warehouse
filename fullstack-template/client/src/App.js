import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch notes from backend
  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Error fetching notes:", err));
  }, []);

  // Handle form submission to add a new note
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Title and content are required!');
      return;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      const newNote = await res.json();
      if (res.ok) {
        setNotes([newNote, ...notes]);
        setTitle('');
        setContent('');
      } else {
        alert(`Error: ${newNote.message || 'Failed to add note'}`);
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert('Error adding note. See console for details.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Notes App</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="note-form">
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Note</button>
        </form>
        <div className="notes-list">
          <h2>Saved Notes</h2>
          {notes.length === 0 ? (
            <p>No notes yet. Add one above!</p>
          ) : (
            notes.map(note => (
              <div key={note._id} className="note-item">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
