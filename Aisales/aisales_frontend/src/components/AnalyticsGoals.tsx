import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target as TargetIcon, Hourglass, Percent } from 'lucide-react';

type Goal = {
  id: number;
  name: string;
  description: string;
  targetRevenue: number;
  currentProgress: number;
  deadline: string; // yyyy-MM-dd from backend LocalDate
  status?: string;
  progressPercentage?: number;
  company?: string;
  priority?: string;
};

type DashboardSummary = {
  totalGoals: number;
  achievedGoals: number;
  pendingGoals: number;
  averageProgress: number;
};

type GoalFormState = {
  name: string;
  description: string;
  targetRevenue: string; // keep as string for input control, cast on submit
  currentProgress: string; // string for control; default 0 on create
  deadline: string; // yyyy-MM-dd
  company: string;
  priority: string;
};

const initialFormState: GoalFormState = {
  name: '',
  description: '',
  targetRevenue: '',
  currentProgress: '0',
  deadline: '',
  company: '',
  priority: 'Medium',
};

const formatDateInputValue = (isoOrDate: string | Date) => {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Backend expects LocalDate (yyyy-MM-dd), so just pass through
const toLocalDateString = (yyyyMmDd: string) => yyyyMmDd;

const currencyUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const priorityClass = (p?: string) => {
  switch ((p || '').toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-muted text-foreground border-border';
  }
};

const AnalyticsGoals: React.FC = () => {
  const { token } = useAuth();

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({ baseURL: 'http://localhost:8080' });
    instance.interceptors.request.use((config) => {
      if (token) {
        if (!config.headers) config.headers = {} as any;
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, [token]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formState, setFormState] = useState<GoalFormState>(initialFormState);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingGoalId(null);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalsRes, summaryRes] = await Promise.all([
        api.get<Goal[]>('/api/goals'),
        api.get<DashboardSummary>('/api/goals/dashboard/summary'),
      ]);
      setGoals(goalsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim(),
        targetRevenue: Number(formState.targetRevenue),
        currentProgress: Number(formState.currentProgress || '0'),
        deadline: toLocalDateString(formState.deadline),
        company: formState.company.trim(),
        priority: formState.priority,
      };

      if (editingGoalId != null) {
        await api.put(`/api/goals/${editingGoalId}`, payload);
        toast.success('Goal updated successfully');
      } else {
        await api.post('/api/goals', payload);
        toast.success('Goal created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      await loadData();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setFormState({
      name: goal.name || '',
      description: goal.description || '',
      targetRevenue: String(goal.targetRevenue ?? ''),
      currentProgress: String(goal.currentProgress ?? '0'),
      deadline: goal.deadline ? formatDateInputValue(goal.deadline) : '',
      company: goal.company || '',
      priority: goal.priority || 'Medium',
    });
    setIsDialogOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this goal?')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/goals/${id}`);
      toast.success('Goal deleted successfully');
      await loadData();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-elegant">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Dashboard Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><TargetIcon className="h-4 w-4" /> Total Goals</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.totalGoals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4" /> Achieved Goals</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.achievedGoals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Hourglass className="h-4 w-4" /> Pending Goals</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.pendingGoals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Percent className="h-4 w-4" /> Average Progress</div>
                </CardHeader>
                <CardContent>
                  <Progress value={summary.averageProgress} />
                  <div className="text-sm text-muted-foreground mt-2">{summary.averageProgress}%</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No summary available.</div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>New Goal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingGoalId != null ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Enter goal name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formState.description}
                    onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Enter goal description"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRevenue">Target Revenue ($)</Label>
                  <Input
                    id="targetRevenue"
                    type="number"
                    value={formState.targetRevenue}
                    onChange={(e) => setFormState((s) => ({ ...s, targetRevenue: e.target.value }))}
                    placeholder="e.g., 10000"
                    required
                    min={0}
                    step={1}
                  />
                </div>
                {editingGoalId != null && (
                  <div className="space-y-2">
                    <Label htmlFor="currentProgress">Current Progress</Label>
                    <Input
                      id="currentProgress"
                      type="number"
                      value={formState.currentProgress}
                      onChange={(e) => setFormState((s) => ({ ...s, currentProgress: e.target.value }))}
                      placeholder="e.g., 250"
                      min={0}
                      step={1}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <select
                    id="company"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formState.company}
                    onChange={(e) => setFormState((s) => ({ ...s, company: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Select a company</option>
                    <option value="Acme Corp">Acme Corp</option>
                    <option value="Globex Inc">Globex Inc</option>
                    <option value="Initech">Initech</option>
                    <option value="Hooli">Hooli</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formState.priority}
                    onChange={(e) => setFormState((s) => ({ ...s, priority: e.target.value }))}
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formState.deadline}
                    onChange={(e) => setFormState((s) => ({ ...s, deadline: e.target.value }))}
                    required
                  />
                </div>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingGoalId != null ? 'Save Changes' : 'Create Goal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Target Revenue ($)</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {loading ? 'Loading goals...' : 'No goals found.'}
                </TableCell>
              </TableRow>
            ) : (
              goals.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell className="max-w-[400px] truncate" title={g.description}>{g.description}</TableCell>
                  <TableCell>{currencyUSD.format(g.targetRevenue ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress className="w-32" value={Math.min(100, Math.round(((g.currentProgress || 0) / (g.targetRevenue || 1)) * 100))} />
                      <span className="text-sm text-muted-foreground">
                        {Math.min(100, Math.round(((g.currentProgress || 0) / (g.targetRevenue || 1)) * 100))}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateInputValue(g.deadline)}</TableCell>
                  <TableCell>
                    {g.company ? (
                      <Badge variant="secondary">{g.company}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {g.priority ? (
                      <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${priorityClass(g.priority)}`}>
                        {g.priority}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(g)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(g.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnalyticsGoals;


