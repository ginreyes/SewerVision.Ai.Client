
export const whatsNewData = [
    {
        id: "v1.7.0",
        date: "February 9-11, 2026",
        label: "Feature Update",
        isNew: true,
        updates: {
            admin: [
                {
                    type: 'improvement',
                    title: 'Unified Customer-Driven Client Field',
                    description: 'Simplified project create/edit forms by making Customer the single source of truth for client information.',
                    image: '/updates/admin/admin_create_project_change_1.png',
                    details: [
                        'Removed the separate "Client (Organization Name)" field across admin/user create and edit flows',
                        'Project client value is now derived from the selected customer (name/email) on save',
                        'Applies consistently to admin create, user create, and admin/user edit pages so all roles follow the same pattern'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Delete Approval & Team Lead Visibility',
                    description: 'Safer project deletion workflow and clearer ownership signals in Admin Projects.',
                    images: [
                        '/updates/admin/admin_project_delete_approval.png',
                        '/updates/user/user_project_pendeng_deletion_table.png',
                        '/updates/user/user_project_pendeng_deletion.png'      
                    ],
                    details: [
                        'Project cards show Team Lead sourced from managerId instead of only the operator',
                        'New deleteRequestedBy, deleteRequestedAt, and deleteStatus fields power a proper delete request workflow',
                        'Pending Deletion badge plus Approve / Reject buttons when deleteStatus is "pending"',
                        'Backend endpoints for requestProjectDelete, approveProjectDelete, and rejectProjectDelete'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Console – AI Processing Modal & Live Logs',
                    description: 'Enhanced SewerVision Project Console for admins with an AI processing modal that shows real-time logs and a clear success state when analysis is complete.',
                    image: '/updates/admin/admin_project_console_ai_modal.png',
                    details: [
                        'AI Processing modal now shows a green success state once AI finishes (status completed or progress 100%)',
                        'Log panel auto-scrolls to the last line so you can follow AI progress without reloading the page',
                        'selectedVideo in ProjectDetail stays in sync with the polled video list so AI progress and status update live',
                        'Polling continues while the modal is open so admins always see up-to-date processing logs'
                    ]
                },
                {
                    type: 'enhancement',
                    title: 'User Management -User Detail Page Overhaul For all Roles',
                    description: 'Enhanced User Detail page with clearer role display, team lead visibility, and user activity insights.',
                    images: [
                        '/updates/admin/admin_user_detail_operator.png',
                        '/updates/admin/admin_user_detail_qc_technician.png',
                        '/updates/admin/admin_user_detail_user.png',
                        '/updates/admin/admin_user_detail_customer.png'
                    ],
                    details: [
                        'User Detail page now shows the user\'s role with a badge and displays their assigned team lead if they have one (managerId)',
                        'For operators and QC techs, added sections showing their recent activity and assigned projects for better context',
                        'For team leads (User role), added a section showing the users they manage (managedMembers) with links to their profiles',
                        'For customers, added a section showing their contact information and any projects they are associated with',
                        'For all roles, improved the layout and styling for better readability and a more professional appearance'
                    ]
                }
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Team Lead Dashboard & Management Portal',
                    description: 'New dedicated workspace for the User (Team Lead) role with its own dashboard, navigation, and management tools.',
                    image: '/updates/user/user_dashboard.png',
                    details: [
                        'User role sees a Management Portal with its own sidebar and navbar, separate from Admin/Operator/QC layouts',
                        'Dashboard highlights the projects you manage, AI processing status, QC progress, and team activity',
                        'Sidebar navigation for Dashboard, My Projects, Track Tasks, Team Management, Device Assignments, and Inbox',
                        'Tour Guide onboarding for the User role explains how to use the new management workspace'
                    ]
                },
                {
                    type: 'feature',
                    title: 'My Projects – Lead View with Grid & Table Modes',
                    description: 'Lead-focused My Projects page that shows only projects where you are the manager, with both grid and table layouts.',
                    image: '/updates/user/user_my_projects_grid_table.png',
                    details: [
                        'Projects scoped by managerId so Team Leads only see projects they own',
                        'Card grid view reuses the rich Admin project cards while hiding admin-only actions',
                        'Table view shows key columns (Project, Client, Location, Status, Priority, Videos) with quick access to the Project Console',
                        'New project create flow for User role reuses the shared wizard and automatically sets you as project manager'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Team Management – View & Manage Your Operators and QC Techs',
                    description: 'Dedicated Team Management page where User role can see all their assigned operators and QC techs, view their activity, and manage assignments.',
                    image: '/updates/user/user_team_management.png',
                    details: [
                        'Team Management page shows all users assigned to your projects (managedMembers) with their role, contact info, and activity status',
                        'Clicking a team member shows their profile with assigned projects, recent activity, and contact options',
                        'Ability to remove users from your team (removes them from managedMembers) or contact them directly via email link',
                        'Future enhancements planned for adding users to your team and managing their project assignments directly from this interface'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Track Tasks – Centralized Task Management for Team Leads',
                    description: 'New Track Tasks page where User role can see all active tasks across their projects, track progress, and manage priorities.',
                    image: '/updates/user/user_task_management.png',
                    details: [
                        'Track Tasks page aggregates all active tasks from your projects (AI processing, QC reviews, report generation) into a single view',
                        'Tasks are categorized by project and type, with status indicators and due dates',
                        'Ability to click into a task to see more details, view related project information, and contact the assigned operator or QC tech if needed',
                        'Future plans to add task management features like priority setting, due date adjustments, and progress updates directly from this interface'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Device Assignments – Monitor and Manage Your Team\'s Equipment',
                    description: 'Device Assignments page where User role can see all equipment assigned to their team, monitor status, and manage assignments.',
                    image: '/updates/user/user_device_assignments.png',
                    details: [
                        'Device Assignments page shows all equipment assigned to users on your team (managedMembers) with real-time status indicators',
                        'Ability to click into a device to see more details, view which team member it\'s assigned to, and contact them if there are any issues',
                        'Future enhancements planned for managing device assignments directly from this interface, including reassigning devices and tracking maintenance schedules'
                     ]
                },
                {
                    type: 'feature',
                    title: 'Inbox & Notifications for Team Leads',
                    description: 'Centralized inbox for the User role to receive notifications about their projects, team activity, and important updates.',
                    image: '/updates/user/user_incomming_soon_inbox.png',
                    details: [
                        'Inbox page where Team Leads receive notifications about project updates, AI processing status changes, QC review completions, and team member activity',
                        'Notifications are categorized by type (Project Updates, Team Activity, System Alerts) with clear indicators for unread messages',
                        'Ability to click into a notification to see more details, view related project or team information, and contact relevant users if needed',
                        'Future plans to allow Team Leads to customize their notification preferences and set up alerts for specific events or thresholds'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Tour Guide Onboarding for User Role',
                    description: 'Interactive tour guide that walks new User role (Team Leads) through their unique dashboard, features, and workflows.',
                    images:[
                        '/updates/user/user_tour_1.png',
                        '/updates/user/user_tour_2.png',
                        '/updates/user/user_tour_3.png',
                        '/updates/user/user_tour_4.png',
                        '/updates/user/user_tour_5.png'
                    ] ,
                    details: [
                        'When a user with the User role logs in for the first time, they are prompted to take a tour of their new dashboard and features',
                        'The tour highlights key areas of the dashboard, explains the purpose of each section, and provides tips on how to use the management tools effectively', 
                        'Users can choose to skip the tour or revisit it later from their profile settings',
                        'The tour is designed to help Team Leads quickly understand how to navigate their workspace, manage their projects and teams, and make the most of the new features available to them'
                    ]

                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Real-Time AI Processing Console for Admin & Operator',
                    description: 'Improved SewerVision.ai AI processing modal with live logs and clear completion state shared by admin and operator consoles.',
                    image: '/updates/operator/operator_project_console_ai_modal.png',
                    details: [
                        'AI processing modal now shows a dedicated success state when status reaches completed or progress hits 100%',
                        'Log panel auto-scrolls to the latest line so operators and admins can follow AI progress without manual scrolling',
                        'selectedVideo stays in sync with the polled video list so AI status and progress update in real time',
                        'Polling continues while the modal is open, updating every few seconds until AI processing is done'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Project Console – Smarter Video Selection & Status Updates',
                    description: 'Enhanced video selection logic in the Project Console that automatically focuses on videos currently being processed by AI.',
                    image: '/updates/operator/operator_project_console_video_selection.png',
                    details: [
                        'When AI processing starts, the video being processed is automatically selected in the console so operators can see real-time status and logs',
                        'If you manually select a different video while AI is processing, the console respects your choice and doesn\'t auto-switch until you refresh or open the modal again',
                        'Once AI processing completes, the console updates to show the final status and allows you to select any video for review'
                    ]
                    
                }
            ],
            qc: [],
            customer: [],
            other: [
                {
                    type: 'security',
                    title: 'Authentication & Storage Hardening',
                    description: 'Improved auth/session handling and storage to be safer in development and production.',
                    details: [
                        'Replaced fragile localStorage-based auth handling with cookie-based storage for tokens and session data',
                        'Adjusted login form and authentication flow for more robust, secure handling of credentials',
                        'Backend and database updates aligned with the new managerId / managedMembers / deleteStatus model fields'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Cleanup & Refactoring',
                    description: 'Removed unused code, standardized imports, and refactored components for better maintainability.',
                    details: [
                        'Removed unused imports and components across admin and user modules',
                        'Standardized import paths and component structures for better readability',
                        'Refactored shared components to reduce duplication and improve consistency',
                        'Improved code comments and documentation for key features and workflows'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.6.0",
        date: "February 3-6, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            qc: [
                {
                    type: 'feature',
                    title: 'Report Creation Wizard with Sidebar Navigation',
                    description: '5-step wizard interface for creating comprehensive PACP sewer inspection reports with validation and review.',
                    image: '/updates/qc-tech/qc_tech_create_new_report_modal_ui.png',
                    details: [
                        'Multi-step wizard: Project → Details → Conditions → Template → Review',
                        'Sidebar navigation with fixed 500px content height',
                        'Smart validation (project & title required)',
                        'Review step with full summary and edit capabilities',
                        'Next/Back buttons with progress tracking',
                        'Instruction cards on each step'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced PACP Template System',
                    description: 'Comprehensive default template with 13 industry-standard sections for complete sewer inspection documentation.',
                    image: '/updates/qc-tech/qc_tech_new_default_template_ui.png',
                    details: [
                        '13 comprehensive PACP sections',
                        'Executive Summary with overall ratings',
                        'AI Detection Results and validation',
                        'Structural and O&M Defects Analysis',
                        'Detailed Observations with PACP codes',
                        'Grading, Scoring, and Recommendations',
                        'QC Verification and compliance tracking'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Template Editor with Section Builder',
                    description: 'Advanced template editor allowing QC techs to create and customize report templates.',
                    image: '/updates/qc-tech/qc_tech_create_new_template_modal_ui.png',
                    details: [
                        'Sidebar-tabbed modal interface',
                        'Dynamic section add/remove functionality',
                        'Field management with comma-separated inputs',
                        'Live template summary with section/field counts',
                        'PACP section suggestions and guidance',
                        'Edit existing templates including defaults'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Enhanced Report Management UI',
                    description: 'Clean, modern card-based interface for managing quality control reports.',
                    image: '/updates/qc-tech/qc_tech_my_report_new_ui.png',
                    details: [
                        'Compact card layout with action dropdowns',
                        'View, Download, Delete, Edit, Share options',
                        'Status badges and grade indicators',
                        'Project filtering (only assigned projects)',
                        'Real-time report statistics',
                        'Detailed 2-day report views'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Premium QC Dashboard Transformation',
                    description: 'Completely rebuilt dashboard with corporate 3-column layout and integrated detection review.',
                    details: [
                        'Visual KPI stat cards for immediate status awareness',
                        'Quick Actions for one-click access',
                        'Integrated Detection Review workflow',
                        'Professional cohesive workspace',
                        'Reduces clicks and improves focus',
                        'Real-time project monitoring'
                    ]
                },
                {
                    type: 'ui',
                    title: 'QC Settings Corporate Style Update',
                    description: 'Sidebar navigation layout matching Operator and Admin settings for consistency.',
                    details: [
                        'Cards + Sidebar design pattern',
                        'Profile, Notifications, System, Security sections',
                        'Consistent lucide-react icons',
                        'Rose/Red theme integration',
                        'Enhanced validation and feedback',
                        'Improved password change workflow'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Advanced Report Detail Interface',
                    description: 'Data-rich detail view with visualizations for defect analysis.',
                    details: [
                        'Linear Pipe Graph visualizing defects',
                        'Severity doughnut charts',
                        'Risk assessment displays',
                        'Full project context strings',
                        'Interactive defect timeline',
                        'Comprehensive metadata display'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Device Management with Glassmorphism',
                    description: 'Modern device tracking interface with status monitoring and maintenance tracking.',
                    image: '/updates/qc-tech/qc_tech_device_management_new_ui.png',
                    details: [
                        'Glassmorphism design with backdrop-blur',
                        'Statistics cards (Total, Active, Offline, Maintenance)',
                        'Real-time search and status filtering',
                        'Status indicators with pulse animations',
                        'Enhanced information display',
                        'Responsive grid layout'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Certifications Module Revamp',
                    description: 'Enhanced certification management with expiration tracking and status badges.',
                    image: '/updates/qc-tech/qc_tech_certifications_new_ui.png',
                    details: [
                        'Glassmorphism design consistency',
                        'Statistics dashboard (Total, Active, Expiring, Expired)',
                        'Enhanced filtering by status',
                        'Gradient status badges',
                        'Expiration date tracking and warnings',
                        'Document upload and retrieval'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Rich-Text Notes with Markdown Support',
                    description: 'Enhanced note-taking with formatting toolbar and markdown syntax.',
                    details: [
                        'Rich text toolbar (Bold, Italic, Code)',
                        'Bullet and numbered lists',
                        'Link formatting [text](url)',
                        'Full markdown syntax support',
                        'Location/Context field for organization',
                        'Extensible metadata support'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-Time Toast Notification System',
                    description: 'Multi-toast support with stacking animations and modern design.',
                    details: [
                        'Multi-toast simultaneous display',
                        'Stacking with sequential delays',
                        'Glassmorphism with gradient accents',
                        '4 types: Success, Error, Info, Warning',
                        'Auto-dismiss with configurable duration',
                        'Manual close button on each toast'
                    ]
                }
            ],
            admin: [
                {
                    type: 'feature',
                    title: 'User Management Complete Revamp',
                    description: 'Modern, compact user management interface with tabs, bulk actions, and enhanced workflows.',
                    details: [
                        'Tabbed interface (User Management / Audit Logs)',
                        'Bulk actions: Export, Email, Disable, Delete',
                        'Compact UI design (not full-height)',
                        'Enhanced table with functional checkboxes',
                        'Real-time user statistics',
                        'Professional action dropdowns'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Email Integration with Resend',
                    description: 'Automated email sending for account creation with secure temporary passwords.',
                    image: '/updates/admin/resend_integration_dashboard.png',
                    details: [
                        'Welcome emails with temporary passwords',
                        'Secure password generation (12 chars, mixed)',
                        'Works with Vercel deployment',
                        'Graceful error handling',
                        'Email templates with branding',
                        'Auto-notification system'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced Add User Modal',
                    description: 'Improved user creation with validation, role-specific fields, and better UX.',
                    details: [
                        'Client-side validation',
                        'Role-specific required fields',
                        'Email format validation',
                        'Loading states during submission',
                        'Clear error messages',
                        'Account creation notice box'
                    ]
                },
                {
                    type: 'planned',
                    title: '🎯 New "User" Role System (Planned)',
                    description: 'Advanced role hierarchy with Team Leaders, Supervisors, and Multi-role access for enhanced team management.',
                    image: '/updates/admin/new_user_role_system_diagram.png',
                    details: [
                        '👥 User Role Types:',
                        '  • Team Head (Operator Teams)',
                        '  • QC Supervisor (Quality Control Teams)',
                        '  • Customer Relations Manager',
                        '  • Cross-functional Team Leads',
                        '',
                        '🔐 Enhanced Permissions:',
                        '  • Higher privileges than base roles',
                        '  • Access to both Operator and QC modules',
                        '  • Team management capabilities',
                        '  • Performance monitoring',
                        '  • Task assignment and delegation',
                        '',
                        '⚙️ Admin Controls:',
                        '  • Admin can create User role accounts',
                        '  • Granular permission assignment',
                        '  • Module access configuration',
                        '  • Custom role combinations',
                        '  • Audit trail for all actions',
                        '',
                        '📊 Management Features:',
                        '  • View and manage operator activities',
                        '  • Oversee QC tech workflows',
                        '  • Generate team performance reports',
                        '  • Approve critical operations',
                        '  • Handle customer escalations',
                        '',
                        '🎯 Use Cases:',
                        '  • Field Operations Manager overseeing operators',
                        '  • Quality Assurance Lead managing QC techs',
                        '  • Account Manager handling customer relations',
                        '  • Project Coordinator with cross-team access',
                        '',
                        '📝 Implementation Roadmap:',
                        '  • Phase 1: Role definition and permissions',
                        '  • Phase 2: User management interface',
                        '  • Phase 3: Module access controls',
                        '  • Phase 4: Team management features',
                        '  • Phase 5: Reporting and analytics'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Calendar & Schedule Management',
                    description: 'Complete calendar system with event management, grid/list views, and real-time statistics.',
                    image: '/updates/operator/new_operator_calendar_page.png',
                    details: [
                        'Dual view modes: Calendar Grid & List',
                        'Event types: Inspection, Maintenance, Meeting, Deadline',
                        'Color-coded event categories',
                        'Create, Edit, Delete event operations',
                        'Status tracking (Scheduled, In Progress, Completed)',
                        'Today\'s schedule widget on dashboard',
                        'Priority levels and location tracking',
                        'Full backend integration with statistics'
                    ]
                },
                {
                    type: 'feature',
                    title: 'My Equipment Management Revamp',
                    description: 'Professional equipment tracking with gradient statistics and enhanced device cards.',
                    image: '/updates/operator/operator_new_equipement_page.png',
                    details: [
                        'Gradient statistics dashboard (Total, Online, Recording, Offline)',
                        'Enhanced device cards with status bars',
                        'Battery, Signal, Activity indicators',
                        'Location tracking per device',
                        'Action dropdown menus (View, Settings, Power)',
                        'Real-time status updates',
                        'Search and filter functionality',
                        'Clean operator design language'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Inspection Logs Dashboard',
                    description: 'Card-based inspection logs with AI workflow pipeline visualization and detailed metrics.',
                    image: '/updates/operator/operator_new_inspection_logs_page.png',
                    details: [
                        'Gradient statistics (Total, AI Processing, QC Review, Completed)',
                        'Card-based layout replacing traditional table',
                        'Visual workflow status pipeline with animations',
                        '4-stage workflow: Upload → AI Analysis → QC Review → Delivery',
                        'Detailed inspection metadata (pipeline ID, location, date, time)',
                        'Video stats (size, duration, issues, confidence)',
                        'Action dropdown per log (Play, View Report, Download, Share)',
                        'AI Workflow Process Overview section'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Inspection Reports Management',
                    description: 'Complete reports module with card-based display, advanced filtering, and bulk actions.',
                    image: '/updates/operator/operator_new_inspection_reports_page.png',
                    details: [
                        'Gradient statistics dashboard (Total, Completed, In Review, Footage)',
                        'Card-based report layout with horizontal design',
                        'Status indicators with pulse animations',
                        'Multi-select with bulk actions (Download, Share, Print)',
                        'Advanced search (ID, Location, Project)',
                        'Filter by status and date range',
                        'Action dropdown per report',
                        'Issues display with color-coded badges'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Generate Report Modal',
                    description: 'Beautiful report creation modal with project selection, smart auto-fill, and validation.',
                    image: '/updates/operator/operator_new_generate_report_modal.png',
                    details: [
                        'Project dropdown (shows only assigned projects)',
                        'Auto-fill location from selected project',
                        'Report title, inspection date, report type',
                        'Footage and location fields',
                        'Initial notes textarea',
                        'Smart validation (required fields)',
                        'Loading states and success handling',
                        'Draft report creation',
                        'Auto-refresh reports after creation'
                    ]
                }
            ],
            customer: [
                
            ],
            other: [
                {
                    type: 'feature',
                    title: 'Backblaze B2 Cloud Storage Migration',
                    description: 'Complete migration from GridFS to Backblaze B2 S3-compatible object storage.',
                    details: [
                        'Private bucket configuration',
                        'Signed URLs for secure downloads',
                        'Streaming support for large videos',
                        'Automatic token management and refresh',
                        'Video and avatar upload to cloud',
                        'Improved scalability and performance'
                    ]
                },
                {
                    type: 'security',
                    title: 'Advanced Confirmation Dialog System',
                    description: 'Professional confirmation dialogs with type-coded styling for critical actions.',
                    details: [
                        'Promise-based async API (showConfirm)',
                        'Danger/Warning/Info type coding',
                        'Smooth animations and backdrop blur',
                        'Customizable titles, messages, and buttons',
                        'Integrated with delete actions',
                        'Prevents accidental data loss'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'API Standardization',
                    description: 'Complete standardization of API calls across all QC modules.',
                    details: [
                        'Centralized API helper (@/lib/helper)',
                        'Consistent error handling patterns',
                        'Standardized authentication headers',
                        'Improved response handling',
                        'Better error messages',
                        'Easier maintenance'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.5.0",
        date: "February 2, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'ui',
                    title: 'Redesigned Admin Settings UI',
                    description: 'Modern, tab-based settings interface with integrated profile management and system controls.',
                    image: '/updates/admin/admin_settings_new_ui.png',
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
                    image: '/updates/admin/admin_user_detail_new_ui.png',
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
                    image: '/updates/operator/new_operator_dashboard.png',
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
                    image: '/updates/operator/new_operator_task_ui.png',
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
                    image: '/updates/operator/new_operation_ui.png',
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
                    image: '/updates/operator/operator_notification_new_ui.png',
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
                    image: '/updates/general/homepage_new_ui.png',
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
                    image: '/updates/general/login_form_ui_new.png',
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
                    image: '/updates/general/new_registration_form.png',
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
                    image: '/updates/general/reset_link_new_ui.png',
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
                    image: '/updates/general/forgot_password_new_ui.png',
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
                    image: '/updates/general/avatar_pop_over_new_ui.png',
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
