import { useState, useEffect } from 'react'
import { Person, personsApi } from '../api'

export function PersonsView() {
  const [persons, setPersons] = useState<Person[]>([])
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const load = async () => {
    const data = await personsApi.list()
    setPersons(data)
  }

  useEffect(() => { load() }, [])

  const addPerson = async () => {
    if (!newName.trim()) return
    await personsApi.create(newName.trim())
    setNewName('')
    load()
  }

  const saveName = async (id: number) => {
    if (!editName.trim()) return
    await personsApi.rename(id, editName.trim())
    setEditId(null)
    load()
  }

  return (
    <div>
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">הוסף אדם</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none"
            placeholder="שם האדם"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPerson()}
          />
          <button
            onClick={addPerson}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            הוסף
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {persons.map(person => (
          <div key={person.id} className="bg-slate-800 rounded-xl p-4">
            {editId === person.id ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 bg-slate-700 rounded-lg px-3 py-1 text-white border border-blue-500 focus:outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(person.id); if (e.key === 'Escape') setEditId(null) }}
                />
                <button onClick={() => saveName(person.id)} className="text-green-400 hover:text-green-300">✓</button>
                <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-300">✕</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{person.name}</p>
                  <p className="text-sm text-slate-400">{person.photoCount} תמונות</p>
                </div>
                <button
                  onClick={() => { setEditId(person.id); setEditName(person.name) }}
                  className="text-slate-400 hover:text-slate-300 text-sm"
                >
                  עריכה
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {persons.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          אין אנשים מוגדרים. הם יתווספו אוטומטית כשתמונות יסרקו.
        </p>
      )}
    </div>
  )
}
