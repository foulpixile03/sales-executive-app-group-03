import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type SentimentType = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';

interface UploadedFile {
  file: File;
  filePath: string;
  fileSize: number;
  contentType: string;
}

interface Company {
  id: number;
  companyName: string;
  type: 'CLIENT' | 'SUPPLIER' | 'PROSPECT';
  industry: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Contact {
  id: number;
  salutation: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  department: string;
  status: string;
  companyId: number;
  companyName: string;
}

interface CallData {
  callTitle: string;
  callDateTime: Date;
  callDirection: 'OUTGOING' | 'INCOMING';
  summary: string;
  companyId: number;
  contactId: number;
  recordingFilePath: string;
  fileSize: number;
  fileType: string;
}

interface SentimentResult {
  callId: number;
  transcript: string;
  sentimentScore: number;
  sentimentType: SentimentType;
  sentimentAnalysis: string;
  status: string;
  message: string;
}

interface Props {
  uploadedFile: UploadedFile | null;
  selectedCompany: Company | null;
  selectedContact: Contact | null;
  onCallDataSubmit: (data: CallData) => void;
  onSentimentAnalysis: (result: SentimentResult) => void;
  sentimentResult: SentimentResult | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SentimentResults: React.FC<Props> = ({
  uploadedFile,
  selectedCompany,
  selectedContact,
  onCallDataSubmit,
  sentimentResult,
}) => {
  const [callDirection, setCallDirection] = useState<'OUTGOING' | 'INCOMING'>('OUTGOING');
  const [summary, setSummary] = useState<string>('');

  const handleSaveCallData = () => {
    if (!uploadedFile || !selectedCompany || !selectedContact) return;

    const payload: CallData = {
      callTitle: 'Untitled Call',
      callDateTime: new Date(),
      callDirection,
      summary,
      companyId: selectedCompany.id,
      contactId: selectedContact.id,
      recordingFilePath: uploadedFile.filePath,
      fileSize: uploadedFile.fileSize,
      fileType: uploadedFile.contentType,
    };

    onCallDataSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Call details for analysis</CardTitle>
          <CardDescription>Choose direction and add an optional summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Call Direction</Label>
            <div className="flex items-center gap-6 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="OUTGOING"
                  checked={callDirection === 'OUTGOING'}
                  onChange={() => setCallDirection('OUTGOING')}
                />
                Outgoing
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="INCOMING"
                  checked={callDirection === 'INCOMING'}
                  onChange={() => setCallDirection('INCOMING')}
                />
                Incoming
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Key points (optional)</Label>
            <Textarea
              id="summary"
              placeholder="Add a short note before analysis..."
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveCallData}>Save call data</Button>
          </div>
        </CardContent>
      </Card>

      {sentimentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest analysis</CardTitle>
            <CardDescription>{sentimentResult.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap">
              {sentimentResult.sentimentAnalysis || 'No analysis yet.'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SentimentResults;

 
