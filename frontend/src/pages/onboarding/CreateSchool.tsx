import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Building2, Users, GraduationCap } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSchoolStore } from '@/stores/schoolStore'
import { useErrorHandler } from '@/lib/api/error-handler'
import { schoolsApi, type CreateSchoolData } from '@/api'
import { toast } from 'sonner'

const CreateSchool = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { setSchool } = useSchoolStore()
  const { handleError } = useErrorHandler()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: '',
    subdomain: '',
    class_structure: 'single'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }

    if (!formData.name.trim() || !formData.subdomain.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(formData.subdomain.toLowerCase())) {
      toast.error('Subdomain can only contain letters, numbers, and hyphens')
      return
    }

    setIsLoading(true)

    try {
      const result = await schoolsApi.createSchoolWithOwner(formData, user.id)
      
      if (result.success && result.data) {
        toast.success('School created successfully!')
        
        // Update user role to 'school_admin' since they now own a school
        setUser({
          ...user!,
          role: 'school_admin',
          school_id: result.data.school.id,
          school_name: result.data.school.name
        })
        
        // Set active school context in global state
        setSchool({
          id: result.data.school.id,
          name: result.data.school.name,
          subdomain: result.data.school.subdomain,
          state: result.data.school.state as any,
          features: [], // Will be loaded later
          settings: {
            theme: {
              primary_color: '#3b82f6',
              secondary_color: '#64748b'
            },
            billing: {
              base_fee: 0,
              feature_costs: {},
              student_cost: 0
            }
          }
        })
        
        console.log('School created and user role updated:', result.data.school)
        
        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        handleError(result.error || 'Failed to create school')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateSchoolData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'subdomain' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '') : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your School</h1>
          <p className="text-gray-600">Set up your school workspace to get started</p>
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School Name */}
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your school name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Subdomain */}
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain *</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    type="text"
                    placeholder="your-school"
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange('subdomain', e.target.value)}
                    disabled={isLoading}
                    required
                    className="rounded-r-none"
                  />
                  <div className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-600">
                    .schoolpulse.app
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This will be your unique school URL. Only letters, numbers, and hyphens allowed.
                </p>
              </div>

              {/* Class Structure */}
              <div className="space-y-3">
                <Label>Class Structure *</Label>
                <RadioGroup
                  value={formData.class_structure}
                  onValueChange={(value: 'single' | 'multi') => handleInputChange('class_structure', value)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Single Class</div>
                        <div className="text-sm text-gray-500">All students in one class</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multi" id="multi" />
                    <Label htmlFor="multi" className="flex items-center gap-2 cursor-pointer">
                      <GraduationCap className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Multiple Classes</div>
                        <div className="text-sm text-gray-500">Different classes and grades</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating School...
                  </>
                ) : (
                  'Create School'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>By creating a school, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}

export default CreateSchool
