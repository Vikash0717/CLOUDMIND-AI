import { useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileId: string;
}

export function ShareFileModal({ isOpen, onClose, fileName, fileId }: ShareFileModalProps) {
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState('view');
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const shareLink = `https://cloudmind.ai/share/abc123xyz`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Share "{fileName}"</DialogTitle>
          <DialogDescription>
            Create a shareable link with custom permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Share with Email</Label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Share Link (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="dark:bg-gray-700 dark:border-gray-600"
              />
              <Button onClick={handleCopy} variant="outline" className="dark:border-gray-600">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Permission Level</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Can View</SelectItem>
                <SelectItem value="edit">Can Edit</SelectItem>
                <SelectItem value="download">Can Download</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Expiring Link</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Link expires in 7 days
              </p>
            </div>
            <Switch checked={expirationEnabled} onCheckedChange={setExpirationEnabled} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Password Protection</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Require password to access
                </p>
              </div>
              <Switch checked={passwordEnabled} onCheckedChange={setPasswordEnabled} />
            </div>
            {passwordEnabled && (
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 dark:border-gray-600">
            Cancel
          </Button>
          <Button
            disabled={!email || isSharing}
            onClick={async () => {
              setIsSharing(true);
              try {
                await api.post('/shared/share', { fileId, email, permission: permission === 'view' ? 'Can View' : permission === 'edit' ? 'Can Edit' : 'Can Download' });
                toast.success(`Shared with ${email} successfully!`);
                onClose();
              } catch (e: any) {
                toast.error(e.response?.data?.error || 'Failed to share file');
              } finally {
                setIsSharing(false);
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share File'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
