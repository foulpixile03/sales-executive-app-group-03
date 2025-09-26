import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Briefcase,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  companyName: string;
}


interface ContactManagementProps {
  onContactSelect: (contact: Contact) => void;
  selectedContact: Contact | null;
  onCompanyNameChange: (companyName: string) => void;
  companyName: string;
}

const ContactManagement: React.FC<ContactManagementProps> = ({
  onContactSelect,
  selectedContact,
  onCompanyNameChange,
  companyName
}) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating new contact
  const [newContact, setNewContact] = useState({
    salutation: 'MR' as 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF' | 'SIR' | 'MADAM',
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phoneNumber: '',
    department: 'PROCUREMENT' as 'PROCUREMENT' | 'IT' | 'FINANCE' | 'OPERATIONS' | 'SALES' | 'MARKETING' | 'HUMAN_RESOURCES' | 'LEGAL' | 'CUSTOMER_SERVICE' | 'OTHER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ON_HOLD',
    companyName: ''
  });

  const salutations = [
    { value: 'MR', label: 'Mr.' },
    { value: 'MRS', label: 'Mrs.' },
    { value: 'MS', label: 'Ms.' },
    { value: 'DR', label: 'Dr.' },
    { value: 'PROF', label: 'Prof.' },
    { value: 'SIR', label: 'Sir' },
    { value: 'MADAM', label: 'Madam' }
  ];

  const departments = [
    'PROCUREMENT', 'IT', 'FINANCE', 'OPERATIONS', 'SALES', 'MARKETING',
    'HUMAN_RESOURCES', 'LEGAL', 'CUSTOMER_SERVICE', 'OTHER'
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' }
  ];


  useEffect(() => {
    fetchAllContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, selectedDepartment]);


  const fetchAllContacts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('finsight_token');
      const response = await fetch('http://localhost:8080/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        throw new Error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'ALL') {
      filtered = filtered.filter(contact => contact.department === selectedDepartment);
    }

    setFilteredContacts(filtered);
  };


  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.firstName.trim() || !newContact.lastName.trim()) return;

    setIsCreating(true);

    try {
      const token = localStorage.getItem('finsight_token');
      
      // Create the contact with company name
      const contactData = {
        salutation: newContact.salutation,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        jobTitle: newContact.jobTitle,
        email: newContact.email,
        phoneNumber: newContact.phoneNumber,
        department: newContact.department,
        status: newContact.status,
        companyName: newContact.companyName
      };

      const contactResponse = await fetch('http://localhost:8080/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData),
      });

      if (contactResponse.ok) {
        const createdContact = await contactResponse.json();
        
        setContacts(prev => [createdContact, ...prev]);
        onContactSelect(createdContact);
        
        // Reset form
        setNewContact({
          salutation: 'MR',
          firstName: '',
          lastName: '',
          jobTitle: '',
          email: '',
          phoneNumber: '',
          department: 'PROCUREMENT',
          status: 'ACTIVE',
          companyName: ''
        });

        toast({
          title: "Contact Created",
          description: `${createdContact.firstName} ${createdContact.lastName} has been created successfully`,
        });
      } else {
        let msg = 'Failed to create contact';
        const ct = contactResponse.headers.get('content-type') || '';
        try {
          if (ct.includes('application/json')) {
            const body = await contactResponse.json();
            msg = body.error || Object.values(body).join(', ') || msg;
          } else {
            const text = await contactResponse.text();
            msg = text || msg;
          }
        } catch {}
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create contact',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };


  return (
    <div className="space-y-6">
      {/* Company Name Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Information (Optional)</span>
          </CardTitle>
          <CardDescription>Add company name if available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              placeholder="Enter company name (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="select" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Select Contact</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Contacts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="department-filter">Filter by Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedContact?.id === contact.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onContactSelect(contact)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">
                            {contact.salutation} {contact.firstName} {contact.lastName}
                          </h3>
                          {selectedContact?.id === contact.id && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{contact.jobTitle}</span>
                          </div>
                          <Badge variant="outline">{contact.department.replace('_', ' ')}</Badge>
                          <Badge className={getStatusColor(contact.status)}>
                            {contact.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          {contact.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phoneNumber && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{contact.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <form onSubmit={handleCreateContact} className="space-y-4">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salutation">Salutation *</Label>
                  <Select 
                    value={newContact.salutation} 
                    onValueChange={(value: any) => 
                      setNewContact(prev => ({ ...prev, salutation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salutations.map(sal => (
                        <SelectItem key={sal.value} value={sal.value}>
                          {sal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newContact.firstName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newContact.lastName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={newContact.jobTitle}
                    onChange={(e) => setNewContact(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Enter job title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={newContact.department} 
                    onValueChange={(value: any) => 
                      setNewContact(prev => ({ ...prev, department: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newContact.status} 
                    onValueChange={(value: any) => 
                      setNewContact(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  value={newContact.companyName}
                  onChange={(e) => setNewContact(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isCreating || !newContact.firstName.trim() || !newContact.lastName.trim()}
              className="w-full"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Contact...
                </div>
              ) : (
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contact
                </div>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* Selected Contact Summary */}
      {selectedContact && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Contact Selected</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedContact.salutation} {selectedContact.firstName} {selectedContact.lastName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactManagement;
