# Claude Code Command: do

## Command Description
This command specializes in implementing new features through a two-phase approach: **Comprehensive Planning** followed by **Targeted Implementation**. It uses think modes extensively during the planning phase to ensure thorough analysis before writing any code.

## Usage
```
/do implement <feature_description> [requirements]
```

### Parameters
- **feature_description** (required): Clear description of the feature to implement
- **requirements** (optional): Specific acceptance criteria, constraints, or technical requirements

### Examples
```
/do implement user authentication with JWT tokens and role-based access
/do implement a real-time chat feature using WebSockets and message history
/do implement file upload with drag-drop, progress tracking, and S3 storage
/do implement a RESTful API for CRUD operations on user profiles
/do implement a dashboard with charts, filters, and export functionality
/do implement search functionality with autocomplete and faceted filters
```

## Command Behavior

### Phase 1: Comprehensive Planning (Think Mode Analysis)

The command uses a progressive thinking approach to thoroughly plan the feature implementation:

#### **Step 1: Feature Analysis (think)**
- Parse feature requirements and acceptance criteria
- Identify core components and dependencies
- Estimate implementation complexity
- Define minimum viable product (MVP) scope

#### **Step 2: Architecture Design (think hard)**
- Design system architecture and data flow
- Identify integration points with existing code
- Plan component hierarchy and relationships
- Consider performance and scalability implications

#### **Step 3: Implementation Strategy (think harder)**
- Break down into logical implementation tasks
- Identify potential risks and edge cases
- Plan testing strategy and validation approach
- Consider error handling and exceptional scenarios

#### **Step 4: Technical Specifications (ultrathink - for complex features)**
- Define detailed technical specifications
- Consider security implications and best practices
- Plan monitoring and observability
- Document architectural decisions and trade-offs

### Phase 2: Targeted Implementation

After comprehensive planning, the command executes implementation in structured stages:

#### **Implementation Stages:**
1. **Setup & Foundation**: Create necessary files, imports, and basic structure
2. **Core Logic**: Implement main business logic and algorithms
3. **Integration**: Connect with existing systems and APIs
4. **UI/UX**: Build user interface components (if applicable)
5. **Testing**: Implement unit tests, integration tests, and validation
6. **Documentation**: Add code documentation and usage examples

#### **Quality Gates:**
- Each stage must meet defined acceptance criteria
- Progressive testing ensures no regressions
- Code review against project standards
- Performance validation against requirements

## Feature Complexity Classification

### **Simple Features** (think → think hard → implement)
**Characteristics:**
- Single component or utility function
- Well-defined requirements with minimal dependencies
- Standard CRUD operations or simple transformations
- Clear acceptance criteria

**Examples:**
- Add pagination to existing list view
- Implement form validation for user input
- Create API endpoint for single resource
- Add basic error handling to existing service

**Planning Depth:** Feature Analysis + Architecture Design
**Implementation Time:** 1-3 hours

### **Moderate Features** (think → think hard → think harder → implement)
**Characteristics:**
- Multiple interacting components
- Integration with external services
- Complex business logic or state management
- Performance considerations

**Examples:**
- User authentication with JWT and roles
- Real-time chat with WebSocket connections
- File upload system with progress tracking
- Search functionality with filtering and sorting

**Planning Depth:** Feature Analysis + Architecture Design + Implementation Strategy
**Implementation Time:** 4-8 hours

### **Complex Features** (think → think hard → think harder → ultrathink → implement)
**Characteristics:**
- System-wide architectural changes
- Multiple integration points and dependencies
- High performance or scalability requirements
- Security and compliance considerations

**Examples:**
- Multi-tenant architecture with data isolation
- Real-time analytics dashboard with streaming data
- Distributed caching system with invalidation
- Event-driven microservices architecture

**Planning Depth:** All four planning phases
**Implementation Time:** Multiple days or sprints

## Implementation Workflow

### **Planning Phase Output:**
The command produces a comprehensive plan including:
- **Requirements Breakdown**: Functional and non-functional requirements
- **Architecture Diagram**: System components and data flow
- **Implementation Tasks**: Structured task list with dependencies
- **Testing Strategy**: Test cases and validation approach
- **Risk Assessment**: Potential blockers and mitigation strategies

### **Implementation Phase Execution:**
1. **Create Implementation Plan**: Use TodoWrite to track all implementation tasks
2. **Progressive Implementation**: Complete tasks in logical order
3. **Continuous Validation**: Test each component before integration
4. **Quality Assurance**: Code review, performance testing, security checks
5. **Documentation**: Update technical documentation and user guides

### **Acceptance Criteria Validation:**
- All functional requirements implemented and tested
- Performance requirements met (response time, throughput)
- Security requirements satisfied (authentication, authorization)
- Code quality standards met (linting, testing coverage)
- Documentation complete and accurate

## Advanced Features

### Planning Customization
Users can specify planning depth and constraints:
```
/do implement user authentication --planning=deep --security=high --testing=comprehensive
/do implement search feature --planning=mvp --performance=fast --framework=existing
/do implement file upload --constraints=storage:100mb --formats=pdf,docx --security=scan
```

### Implementation Constraints
Users can specify technical constraints and requirements:
```
/do implement real-time notifications --tech-stack=websocket,redis --max-users=1000
/do implement analytics dashboard --framework=react,chartjs --export=csv,pdf
/do implement API gateway --rate-limit=100req/s --auth=oauth2,jwt
```

### Planning Mode Transparency
The command explains its planning decisions:
```
Feature Analysis: User Authentication (Moderate Complexity)
Planning Phases: think → think hard → think harder (estimated 45 minutes)
Key Components: Login, Register, Token Management, Role-based Access
Integration Points: Database, Email Service, Frontend Auth Context
Risks: Security vulnerabilities, Token refresh logic, Session management
```

### Iterative Development Support
For large features, the command can implement iteratively:
```
/do implement e-commerce platform --iteration=mvp --features=products,cart,checkout
/do implement analytics platform --iteration=v2 --features=real-time,export,alerts
```

## Integration Guidelines

### Project Standards Compliance
All thinking modes follow established patterns:
- **Architecture**: Domain-Driven Design with hexagonal architecture
- **Code Quality**: Ruff formatting, type hints, 80% test coverage
- **Error Handling**: Custom exception hierarchy
- **Performance**: Async/await patterns, caching considerations

### Mode-Specific Behaviors

#### Think Mode
- Quick, direct solutions
- Use existing patterns
- Minimal testing
- Basic documentation

#### Think Hard Mode  
- Moderate analysis depth
- Some architectural consideration
- Unit and integration tests
- Good documentation

#### Think Harder Mode
- Deep architectural analysis  
- Multiple solution approaches considered
- Comprehensive testing strategy
- Detailed documentation with examples

#### Ultrathink Mode
- Exhaustive problem space exploration
- Multiple implementation alternatives
- Full system impact analysis
- Complete testing and monitoring
- Architectural decision records
- Long-term maintenance considerations

## Example Workflows

### Example 1: Simple Feature Implementation
```
User: /do implement user registration with email verification
```
**Planning Phase:**
1. **Feature Analysis (think)**: Basic CRUD with email service integration
2. **Architecture Design (think hard)**: User model, email templates, verification flow
**Implementation Phase:**
3. **Setup**: Create user model, migration, basic routes
4. **Core Logic**: Registration service, email verification, token handling
5. **Integration**: Connect email service, add verification endpoint
6. **Testing**: Unit tests for registration flow, integration tests

### Example 2: Moderate Feature Implementation
```
User: /do implement real-time chat with WebSocket and message persistence
```
**Planning Phase:**
1. **Feature Analysis (think)**: Chat rooms, real-time messaging, message history
2. **Architecture Design (think hard)**: WebSocket server, message storage, user presence
3. **Implementation Strategy (think harder)**: Scalability, connection management, offline handling
**Implementation Phase:**
4. **Foundation**: WebSocket setup, message schema, room management
5. **Core Features**: Real-time messaging, user authentication in chat
6. **Advanced**: Message persistence, chat history, user presence
7. **Testing**: WebSocket tests, load testing, message delivery verification

### Example 3: Complex Feature Implementation
```
User: /do implement multi-tenant SaaS with data isolation and role-based permissions
```
**Planning Phase:**
1. **Feature Analysis (think)**: Tenancy model, data isolation, authentication
2. **Architecture Design (think hard)**: Database design, middleware, security layers
3. **Implementation Strategy (think harder)**: Migration strategy, security implications
4. **Technical Specifications (ultrathink)**: Performance optimization, monitoring, compliance
**Implementation Phase:**
5. **Foundation**: Tenant identification, database schema, security middleware
6. **Core Features**: User management, role assignment, data filtering
7. **Advanced Features**: Tenant onboarding, billing integration, analytics
8. **Security**: Audit logging, compliance checks, penetration testing

### Example 4: Iterative Feature Development
```
User: /do implement e-commerce platform --iteration=mvp
```
**Planning Phase:**
1. **Feature Analysis**: Core e-commerce features for MVP (products, cart, checkout)
2. **Architecture Design**: Microservices approach for future scalability
3. **Implementation Strategy**: Prioritized feature rollout
**Implementation Phase:**
4. **Iteration 1 (MVP)**: Product catalog, shopping cart, basic checkout
5. **Future Iterations**: User reviews, recommendations, advanced analytics

## Implementation Challenges and Solutions

### Planning Phase Challenges
- **Incomplete Requirements**: Request clarification and define assumptions clearly
- **Technical Uncertainties**: Research and prototype before finalizing architecture
- **Scope Creep**: Define MVP boundaries and defer non-essential features
- **Dependency Conflicts**: Identify alternatives or plan dependency updates

### Implementation Phase Challenges
- **Integration Issues**: Build integration tests early, validate contracts
- **Performance Bottlenecks**: Profile during development, optimize iteratively
- **Testing Gaps**: Implement test-driven development for critical components
- **Documentation Debt**: Document during implementation, not after

### Quality Assurance Challenges
- **Requirement Misalignment**: Regular stakeholder reviews and demos
- **Technical Debt**: Schedule refactoring sprints and code reviews
- **Security Vulnerabilities**: Security reviews and automated scanning
- **Performance Regressions**: Continuous performance monitoring

## Success Metrics

### Feature Implementation Metrics
- **Planning Accuracy**: Planned vs. actual implementation time
- **Quality Metrics**: Bug density, test coverage, performance benchmarks
- **User Satisfaction**: Feature adoption rates and user feedback
- **Development Velocity**: Features delivered per iteration

### Continuous Improvement
- **Planning Process Refinement**: Improve requirement gathering and estimation
- **Architecture Pattern Library**: Document reusable patterns and decisions
- **Implementation Playbooks**: Create standardized implementation guides
- **Team Knowledge Sharing**: Regular architecture reviews and lessons learned

This specialized feature implementation command ensures comprehensive planning followed by structured execution, delivering high-quality features that meet requirements while maintaining code quality and system integrity.