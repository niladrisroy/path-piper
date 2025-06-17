
"use client"

import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, X, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface EducationEntry {
  id?: string;
  institutionName: string;
  institutionTypeId: number | null;
  institutionTypeName?: string;
  degreeProgram?: string;
  fieldOfStudy?: string;
  gradeLevel?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  subjects?: string[];
}

interface EducationStepProps {
  initialData: EducationEntry[];
  onComplete: (educationHistory: EducationEntry[]) => void;
  onNext?: () => void;
  onSkip?: () => void;
  ageGroup?: string;
}

export default function EducationStep({ 
  initialData, 
  onComplete, 
  onNext, 
  onSkip, 
  ageGroup 
}: EducationStepProps) {
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>(initialData || []);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState<EducationEntry>({
    institutionName: '',
    institutionTypeId: null,
    degreeProgram: '',
    fieldOfStudy: '',
    gradeLevel: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    subjects: []
  });

  // Fetch institution types on component mount
  useEffect(() => {
    const fetchInstitutionTypes = async () => {
      try {
        const response = await fetch('/api/institution-types');
        if (response.ok) {
          const data = await response.json();
          setInstitutionTypes(data.institutionTypes || []);
        }
      } catch (error) {
        console.error('Error fetching institution types:', error);
      }
    };

    fetchInstitutionTypes();
  }, []);

  const handleAddEntry = () => {
    if (!newEntry.institutionName.trim()) {
      toast.error('Please enter an institution name');
      return;
    }

    if (!newEntry.startDate) {
      toast.error('Please enter a start date');
      return;
    }

    const entry: EducationEntry = {
      ...newEntry,
      id: Date.now().toString(), // Temporary ID for frontend
      institutionTypeName: institutionTypes.find(type => type.id === newEntry.institutionTypeId)?.name || 'Institution'
    };

    setEducationHistory([...educationHistory, entry]);
    setNewEntry({
      institutionName: '',
      institutionTypeId: null,
      degreeProgram: '',
      fieldOfStudy: '',
      gradeLevel: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      subjects: []
    });
    setIsAddingEntry(false);
    toast.success('Education entry added successfully');
  };

  const handleRemoveEntry = (index: number) => {
    const updatedHistory = educationHistory.filter((_, i) => i !== index);
    setEducationHistory(updatedHistory);
    toast.success('Education entry removed');
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      if (educationHistory.length > 0) {
        // Save education history to database
        const response = await fetch('/api/education', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ educationHistory }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error('Failed to save education history: ' + (error.message || 'Unknown error'));
          return;
        }

        toast.success('Education history saved successfully');
      }

      onComplete(educationHistory);
    } catch (error) {
      console.error('Error saving education history:', error);
      toast.error('Failed to save education history');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <GraduationCap className="h-12 w-12 text-pathpiper-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Your Educational Journey</h2>
        <p className="text-muted-foreground mt-2">
          Add your educational background from any type of institution
        </p>
      </div>

      {/* Education History List */}
      <div className="space-y-4">
        {educationHistory.map((entry, index) => (
          <Card key={entry.id || index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{entry.institutionName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{entry.institutionTypeName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEntry(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {entry.degreeProgram && (
                  <div>
                    <span className="font-medium">Program:</span> {entry.degreeProgram}
                  </div>
                )}
                {entry.gradeLevel && (
                  <div>
                    <span className="font-medium">Grade/Level:</span> {entry.gradeLevel}
                  </div>
                )}
                <div>
                  <span className="font-medium">Period:</span> {entry.startDate} - {entry.isCurrent ? 'Present' : entry.endDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Entry Form */}
        {isAddingEntry && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Education Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Institution Name *</label>
                  <Input
                    value={newEntry.institutionName}
                    onChange={(e) => setNewEntry({ ...newEntry, institutionName: e.target.value })}
                    placeholder="Enter institution name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Institution Type</label>
                  <Select
                    value={newEntry.institutionTypeId?.toString() || ''}
                    onValueChange={(value) => setNewEntry({ ...newEntry, institutionTypeId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Program/Course</label>
                  <Input
                    value={newEntry.degreeProgram || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, degreeProgram: e.target.value })}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Grade/Level</label>
                  <Input
                    value={newEntry.gradeLevel || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, gradeLevel: e.target.value })}
                    placeholder="e.g., Class 12, 1st Year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={newEntry.startDate}
                    onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newEntry.endDate || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value })}
                    disabled={newEntry.isCurrent}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCurrent"
                  checked={newEntry.isCurrent}
                  onCheckedChange={(checked) => setNewEntry({ 
                    ...newEntry, 
                    isCurrent: !!checked,
                    endDate: checked ? '' : newEntry.endDate
                  })}
                />
                <label htmlFor="isCurrent" className="text-sm font-medium">
                  I am currently studying here
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={newEntry.description || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Describe your experience, achievements, or other details"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingEntry(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Entry Button */}
        {!isAddingEntry && (
          <Button
            variant="outline"
            onClick={() => setIsAddingEntry(true)}
            className="w-full border-dashed border-2 border-gray-300 hover:border-pathpiper-teal hover:bg-pathpiper-teal/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education Entry
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={loading}
        >
          Skip for now
        </Button>
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
