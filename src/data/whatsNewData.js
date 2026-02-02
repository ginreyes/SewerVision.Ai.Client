
export const whatsNewData = [
    {
        id: "v1.5.0",
        date: "February 2, 2026",
        label: "Major Release",
        isNew: true,
        updates: {
            admin: [

                {
                    type: 'ui',
                    title: 'Redesigned Admin Settings UI',
                    description: 'Modern, tab-based settings interface with integrated profile management and system controls.',
                    image: '/updates/admin_settings_new_ui.png',
                    details: [
                        'Vertical sidebar navigation',
                        'Integrated profile & password management',
                        'Enhanced AI model configuration',
                        'User-friendly system maintenance controls'
                    ]
                },
                {
                    type: 'feature',
                    title: 'User Management Enhancements',
                    description: 'Streamlined user administration with new direct action capabilities.',
                    image: '/updates/admin_user_detail_new_ui.png',
                    details: [
                        'Direct "Send Email" feature in user table',
                        'One-click Account Disable/Enable toggle',
                        'Improved user status visibility',
                        'Quick access to operator settings'
                    ]
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'AI-Powered Defect Detection',
                    description: 'Advanced AI algorithms for automated defect identification with 95%+ accuracy.',
                    image: '/updates/qc_ai_detection.png',
                    details: [
                        'Real-time defect classification',
                        'Severity scoring system',
                        'Historical comparison analytics',
                        'Export reports in multiple formats'
                    ]
                },
                {
                    type: 'feature',
                    title: 'PACP Compliance Reports',
                    description: 'Generate industry-standard PACP compliant reports with one click.',
                    image: '/updates/qc_pacp_reports.png',
                    details: [
                        'Automated PACP code assignment',
                        'Customizable report templates',
                        'Photo documentation integration',
                        'Digital signature support'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Enhanced QC Workflow',
                    description: 'Streamlined quality control process with intelligent task prioritization.',
                    image: '/updates/qc_workflow.png',
                    details: [
                        'Priority-based task queue',
                        'Collaborative review process',
                        'Mobile-friendly interface',
                        'Offline mode support'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'New Data-Rich Operator Dashboard',
                    description: 'Comprehensive dashboard showing all active inspections, equipment status, and performance metrics.',
                    image: '/updates/new_operator_dashboard.png',
                    details: [
                        'Real-time equipment status tracking',
                        'Active inspection monitoring',
                        'Performance analytics and KPIs',
                        'Quick access to recent projects'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Dedicated Task Management System',
                    description: 'Organize and prioritize your daily operations with our new task management interface.',
                    image: '/updates/new_operator_task_ui.png',
                    details: [
                        'Drag-and-drop task organization',
                        'Status tracking and progress updates',
                        'Assignment notifications',
                        'Calendar integration'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Streamlined Operations Workflow',
                    description: 'Simplified workflow for creating and managing inspection operations.',
                    image: '/updates/new_operation_ui.png',
                    details: [
                        'Step-by-step operation wizard',
                        'Template-based quick start',
                        'Equipment checklist integration',
                        'Pre-inspection safety checks'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-time Smart Notifications',
                    description: 'Stay informed with intelligent notifications for critical events and updates.',
                    image: '/updates/operator_notification_new_ui.png',
                    details: [
                        'Customizable notification preferences',
                        'Priority-based alerts',
                        'In-app and email notifications',
                        'Notification history and archive'
                    ]
                }
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Interactive Project Dashboard',
                    description: 'View all your projects and inspection reports in one centralized location.',
                    image: '/updates/customer_dashboard.png',
                    details: [
                        'Project timeline visualization',
                        'Real-time status updates',
                        'Quick report access',
                        'Download all project files'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Enhanced Report Viewer',
                    description: 'Beautiful, interactive report viewer with zoom, annotations, and sharing capabilities.',
                    image: '/updates/customer_report_viewer.png',
                    details: [
                        'High-resolution image viewing',
                        'Video playback with timeline',
                        'Defect highlighting',
                        'One-click sharing options'
                    ]
                }
            ],
            other: [
                {
                    type: 'ui',
                    title: 'Redesigned Homepage',
                    description: 'Beautiful new homepage with immersive animations and modern design.',
                    image: '/updates/homepage_new_ui.png',
                    details: [
                        'Smooth scroll animations',
                        'Responsive design for all devices',
                        'Fast loading performance',
                        'Accessibility improvements'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced Login Experience',
                    description: 'Modern authentication flow with glassmorphism design and improved security.',
                    image: '/updates/login_form_ui_new.png',
                    details: [
                        'Glassmorphism UI design',
                        'Social login integration',
                        'Remember me functionality',
                        'Password strength indicator'
                    ]
                },
                {
                    type: 'feature',
                    title: 'New Registration Flow',
                    description: 'Streamlined registration process for all user roles with guided onboarding.',
                    image: '/updates/new_registration_form.png',
                    details: [
                        'Role-based registration forms',
                        'Progressive form validation',
                        'Welcome email automation',
                        'Account verification system'
                    ]
                },
                {
                    type: 'security',
                    title: 'Secure Password Reset',
                    description: 'Enhanced password recovery with secure token-based authentication.',
                    image: '/updates/reset_link_new_ui.png',
                    details: [
                        'Secure token generation',
                        'Email verification required',
                        'Password strength validation',
                        'Auto-expiring reset links'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Revamped Forgot Password UI',
                    description: 'Clean, user-friendly interface for password recovery.',
                    image: '/updates/forgot_password_new_ui.png',
                    details: [
                        'Split-screen design',
                        'Clear instructions',
                        'Success confirmation',
                        'Easy navigation back to login'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Avatar Pop-over Menu',
                    description: 'Quick access to profile settings and account options.',
                    image: '/updates/avatar_pop_over_new_ui.png',
                    details: [
                        'Profile quick view',
                        'Theme toggle',
                        'Notification preferences',
                        'Quick logout option'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.2.0",
        date: "January 20, 2026",
        label: "Stability Update",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'fix',
                    title: 'Fixed authentication redirect loops',
                    description: 'Resolved an issue where users would get stuck in authentication loops.',
                    details: [
                        'Improved session handling',
                        'Better error messages',
                        'Automatic retry mechanism'
                    ]
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'Reports Analytics Dashboard',
                    description: 'New analytics dashboard with interactive charts and insights.',
                    image: '/updates/qc_analytics.png',
                    details: [
                        'Interactive data visualization',
                        'Custom date range filtering',
                        'Export to Excel/PDF',
                        'Trend analysis'
                    ]
                }
            ],
            operator: [
                {
                    type: 'improvement',
                    title: 'Performance Optimization',
                    description: 'Improved loading times and overall performance.',
                    details: [
                        'Faster page loads',
                        'Optimized image loading',
                        'Reduced memory usage'
                    ]
                }
            ],
            customer: [],
            other: [
                {
                    type: 'security',
                    title: 'Next.js Security Updates',
                    description: 'Updated to Next.js v15.3.x with latest security patches.',
                    details: [
                        'Framework security updates',
                        'Dependency vulnerability fixes',
                        'Improved CSRF protection'
                    ]
                }
            ]
        }
    }
];
