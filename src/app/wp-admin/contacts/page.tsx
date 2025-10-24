'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Contact = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contact', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch contacts');
        const data = await res.json();
        // Assuming the API returns an array of contacts directly
        setContacts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/contact?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      
      setContacts(prev => prev.filter(c => c._id !== deleteId));
      setDeleteId(null);
      // Optionally, show a success toast
    } catch (error) {
      console.error(error);
      // Optionally, show an error toast
    }
  };

  const filteredContacts = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) return contacts;

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercasedFilter) ||
      contact.email.toLowerCase().includes(lowercasedFilter) ||
      contact.subject.toLowerCase().includes(lowercasedFilter)
    );
  }, [contacts, searchTerm]);

  const getBadgeVariant = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('feedback')) return 'secondary';
    if (lowerSubject.includes('newsletter')) return 'outline';
    if (lowerSubject.includes('enquiry')) return 'default';
    return 'destructive';
  };

  return (
    <div className="pt-6 pb-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>📬 Contact Submissions</CardTitle>
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">From</TableHead>
                  <TableHead>Subject & Message</TableHead>
                  <TableHead className="w-[180px] text-right">Received</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading contacts...</TableCell></TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No submissions found.</TableCell></TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                      <TableCell>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getBadgeVariant(contact.subject)}>{contact.subject || 'No Subject'}</Badge>
                          <span className="text-muted-foreground truncate">- {contact.message}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(contact._id); }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                  </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedContact && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50" onClick={() => setSelectedContact(null)}>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedContact.subject || 'No Subject'}</CardTitle>
                  <p className="text-sm text-muted-foreground">From: {selectedContact.name} &lt;{selectedContact.email}&gt;</p>
                  <p className="text-xs text-muted-foreground mt-1">Received: {new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border">
                <p className="whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </CardContent>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this submission? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
