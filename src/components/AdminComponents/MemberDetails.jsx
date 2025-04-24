'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { AlertDialogAction } from '@/components/ui/alert-dialog';
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { AlertDialogContent } from '@/components/ui/alert-dialog';
import { AlertDialogDescription } from '@/components/ui/alert-dialog';
import { AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialogHeader } from '@/components/ui/alert-dialog';
import { AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select } from '@/components/ui/select';
import { SelectContent } from '@/components/ui/select';
import { SelectItem } from '@/components/ui/select';
import { SelectTrigger } from '@/components/ui/select';
import { SelectValue } from '@/components/ui/select';
import { db } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import ActiveMemberMonthYearPicker from '@/components/ActiveMemberMonthYearPicker';
import { Calendar, Phone, User, UserCheck, UserX, FileText, Pencil } from 'lucide-react';

const RESIDENT_TYPES = {
  DINING: 'dining',
  ROOM: 'room',
};

const MemberDetails = ({ member }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [shortnameInput, setShortnameInput] = useState('');
  const [archiveFrom, setArchiveFrom] = useState('');
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    fullname: member?.fullname || '',
    resident: member?.resident || '',
    phone: member?.phone || '',
    imageUrl: member?.imageUrl || '',
  });
  const [editError, setEditError] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  if (!member) {
    return (
      <Card className="w-full mx-auto mt-4 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center py-12">No member selected</p>
        </CardContent>
      </Card>
    );
  }

  const memberSinceDate = useMemo(() => {
    return member.activeFrom
      ? new Date(member.activeFrom.split('-')[0], member.activeFrom.split('-')[1] - 1).toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';
  }, [member.activeFrom]);

  const archiveDate = useMemo(() => {
    return member.archiveFrom
      ? new Date(member.archiveFrom.split('-')[0], member.archiveFrom.split('-')[1] - 1).toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : null;
  }, [member.archiveFrom]);

  const handleArchive = async () => {
    if (shortnameInput.toLowerCase() !== member.shortname.toLowerCase()) {
      setError("Shortname doesn't match. Please try again.");
      return;
    }

    if (!archiveFrom) {
      setError('Please select an archive month.');
      return;
    }

    setIsArchiving(true);
    try {
      const memberRef = doc(db, 'members', member.id);
      await updateDoc(memberRef, {
        status: 'archived',
        archiveFrom,
      });
      toast({
        title: 'Member Archived',
        description: `${member.fullname} will be archived from ${archiveFrom}.`,
      });
      setShowConfirm(false);
      setShortnameInput('');
      setArchiveFrom('');
      setError('');
    } catch (err) {
      console.error('Error archiving member:', err);
      setError('Failed to archive member.');
      toast({
        title: 'Error',
        description: 'Failed to archive member.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSelectChange = (value) => {
    setEditData({
      ...editData,
      resident: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editData.fullname || !editData.resident) {
      setEditError('Full Name and Resident Type are required.');
      return;
    }

    try {
      const memberDocRef = doc(db, 'members', member.id);
      await updateDoc(memberDocRef, {
        fullname: editData.fullname,
        resident: editData.resident,
        phone: editData.phone,
        imageUrl: editData.imageUrl || '',
      });

      toast({
        title: 'Success',
        description: 'Member details updated successfully!',
        variant: 'success',
      });

      setShowEdit(false);
      setEditError('');
    } catch (err) {
      console.error('Firestore Error:', err.message);
      setEditError('Failed to update member details.');
      toast({
        title: 'Error',
        description: 'Failed to update member details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg border border-gray-200 rounded-xl overflow-hidden mt-4">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-800">Member Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={member.status === 'archived' ? 'destructive' : 'default'}>
                {member.status === 'archived' ? 'Archived' : 'Active'}
              </Badge>
              {member.status !== 'archived' && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEdit(true)}
                  className="text-purple-600 hover:text-purple-700 shadow-sm rounded-lg"
                  aria-label="Edit member"
                >
                  <Pencil size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start">
            <div className="flex flex-col items-center md:w-1/3 mb-6 md:mb-0 md:pr-6">
              {member.imageUrl && (
                <div className="relative mb-4">
                  <img
                    src={member.imageUrl}
                    alt={`Profile image of ${member.fullname}`}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                    <Badge className="h-6 w-6 rounded-full p-1 flex items-center justify-center">
                      {member.resident === 'permanent' ? 'P' : 'T'}
                    </Badge>
                  </div>
                </div>
              )}
              <h2 className="text-xl font-bold text-center text-gray-800">{member.fullname}</h2>
              <p className="text-gray-500 text-sm">{member.shortname}</p>
            </div>

            <div className="hidden md:block border-r border-gray-200 h-full" />

            <div className="md:w-2/3 md:pl-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-500" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Member ID</span>
                    <span className="font-medium text-gray-900">{member.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-500" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Resident Type</span>
                    <span className="font-medium text-gray-900 capitalize">{member.resident}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-500" />
                  <div className="flex justify-between w-full items-center">
                    <span className="text-gray-600">Phone Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.phone || 'N/A'}</span>
                      {member.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-blue-600 hover:text-blue-700 shadow-sm rounded-lg"
                          aria-label={`Call ${member.fullname} at ${member.phone}`}
                        >
                          <a href={`tel:${member.phone}`}>
                            <Phone size={16} />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck size={18} className="text-gray-500" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">{memberSinceDate}</span>
                  </div>
                </div>

                {archiveDate && (
                  <div className="flex items-center gap-3">
                    <UserX size={18} className="text-gray-500" />
                    <div className="flex justify-between w-full">
                      <span className="text-gray-600">Archived From</span>
                      <span className="font-medium text-gray-900">{archiveDate}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {member.status !== 'archived' && (
                <div className="mt-2 flex justify-start">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shadow-sm rounded-lg px-4 py-2"
                    onClick={() => setShowConfirm(true)}
                    variant="destructive"
                    disabled={isArchiving}
                    aria-label="Archive member"
                  >
                    <UserX size={16} className="mr-2" />
                    Archive Member
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {member.fullname}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the member as archived. Please complete the information below to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="archiveDate" className="text-sm font-medium">
                Archive From
              </Label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3 text-gray-500" />
                <div className="pl-10">
                  <ActiveMemberMonthYearPicker value={archiveFrom} onChange={setArchiveFrom} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortname" className="text-sm font-medium">
                Confirm by entering member's shortname
              </Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-500" />
                <Input
                  id="shortname"
                  type="text"
                  value={shortnameInput}
                  onChange={(e) => setShortnameInput(e.target.value)}
                  placeholder="Enter shortname"
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirm(false);
                setShortnameInput('');
                setArchiveFrom('');
                setError('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleArchive}
              disabled={isArchiving}
            >
              Confirm Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEdit} onOpenChange={setShowEdit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Member Details</AlertDialogTitle>
            <AlertDialogDescription>
              Update the member's information. Fields marked with * are required.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={editData.fullname}
                  onChange={handleEditChange}
                  placeholder="Enter member's full name"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resident" className="text-sm font-medium">
                  Resident Type *
                </Label>
                <Select onValueChange={handleEditSelectChange} value={editData.resident}>
                  <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm">
                    <SelectValue placeholder="Select resident type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                    <SelectItem value={RESIDENT_TYPES.DINING} className="py-2.5 text-base font-medium">
                      Dining
                    </SelectItem>
                    <SelectItem value={RESIDENT_TYPES.ROOM} className="py-2.5 text-base font-medium">
                      Room
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={handleEditChange}
                  placeholder="Enter phone number"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">
                  Profile Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={editData.imageUrl}
                  onChange={handleEditChange}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
              </div>
            </div>

            {editError && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">{editError}</p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowEdit(false);
                  setEditData({
                    fullname: member.fullname,
                    resident: member.resident,
                    phone: member.phone,
                    imageUrl: member.imageUrl,
                  });
                  setEditError('');
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MemberDetails;