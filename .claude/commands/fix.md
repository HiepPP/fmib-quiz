# Claude Code Command: fix

## Command Description
This command specializes in diagnosing and fixing errors with targeted solutions based on provided error details. It analyzes error patterns, identifies root causes, and applies appropriate fixing strategies based on error type, complexity, and context.

## Usage
```
/fix <error_details> [context_info]
```

### Parameters
- **error_details** (required): The specific error message, stack trace, or symptom
- **context_info** (optional): Additional context about when/where the error occurs

### Examples
```
/fix "TypeError: Cannot read property 'map' of undefined" in React component
/fix "ModuleNotFoundError: No module named 'requests'" when running pytest
/fix "Connection refused" error when connecting to Neo4j at localhost:7687
/fix Build failed with "TS2322: Type 'string' is not assignable to type 'number'"
/fix "500 Internal Server Error" on API endpoint /api/users
/fix Docker container exits with "OSError: [Errno 98] Address already in use"
```

## Command Behavior

### Step 1: Error Analysis
When invoked with error details, the command analyzes:
1. **Error Type Classification**: Syntax, runtime, logic, network, dependency, configuration
2. **Severity Assessment**: Critical blocker vs. warning vs. performance issue
3. **Context Extraction**: File paths, line numbers, stack traces, environment details
4. **Pattern Recognition**: Common error patterns vs. unique issues
5. **Root Cause Identification**: Direct symptoms vs. underlying causes
6. **Impact Scope**: Localized vs. system-wide effects

### Step 2: Error Category Classification

#### **Type A: Syntax/Language Errors** - Quick Fix Mode
**Triggers:**
- Syntax errors, type mismatches, import issues
- Missing dependencies, version conflicts
- Linting errors, formatting issues
- Simple configuration problems

**Keywords:** `TypeError`, `SyntaxError`, `ImportError`, `ModuleNotFoundError`, `TS2322`

**Examples:**
- "Cannot read property 'map' of undefined"
- "No module named 'requests'"
- "Type 'string' is not assignable to type 'number'"

**Fix Strategy:** Immediate code correction with proper syntax/types

#### **Type B: Runtime/Logic Errors** - Analysis Mode
**Triggers:**
- Null/undefined references, boundary conditions
- Logic flow errors, state management issues
- Async/await problems, race conditions
- Database connection/query issues

**Keywords:** `Cannot read property`, `undefined`, `null`, `Connection refused`, `timeout`

**Examples:**
- "Cannot read property 'X' of undefined"
- "Connection refused to database"
- "Promise rejected" errors

**Fix Strategy:** Code analysis + targeted refactoring with defensive programming

#### **Type C: System/Infrastructure Errors** - Investigation Mode
**Triggers:**
- Network connectivity, service availability
- Container orchestration, deployment issues
- Performance bottlenecks, resource constraints
- Security/authentication problems

**Keywords:** `ECONNREFUSED`, `ENOTFOUND`, `500 Internal Server Error`, `Unauthorized`, `OSError`

**Examples:**
- "Connection refused" on service endpoints
- "Address already in use" Docker errors
- "503 Service Unavailable" API errors

**Fix Strategy:** System diagnosis + configuration/environment fixes

#### **Type D: Integration/Architecture Errors** - Deep Investigation Mode
**Triggers:**
- Cross-service communication failures
- Complex dependency injection issues
- Architecture pattern violations
- Performance optimization across systems

**Keywords:** `circular dependency`, `deadlock`, `memory leak`, `bottleneck`, `scalability`

**Examples:**
- Circular dependency in module imports
- Memory leaks in long-running processes
- Performance degradation under load

**Fix Strategy:** Architecture review + system design improvements

### Step 3: Error Fixing Workflow

#### Error Diagnosis Process:
1. **Parse Error Details**: Extract error message, stack trace, file paths, line numbers
2. **Classify Error Type**: Match against known error patterns and categories
3. **Analyze Context**: Review code location, environment, recent changes
4. **Identify Root Cause**: Distinguish symptoms from underlying issues
5. **Select Fix Strategy**: Choose appropriate fixing approach based on error type

#### Execution Steps:
1. **Error Analysis Report**:
   - Display identified error type and severity
   - Show affected files and code locations
   - Explain likely root causes and contributing factors
   - Outline proposed fixing strategy

2. **Implement Fix**:
   - Apply targeted code corrections for syntax/language errors
   - Refactor logic and add defensive programming for runtime errors
   - Adjust configuration/environment for system errors
   - Redesign architecture patterns for integration errors

3. **Verification**:
   - Test the fix with relevant scenarios
   - Ensure no regression in existing functionality
   - Validate error resolution and root cause elimination
   - Document the fix and prevention strategies

### Step 4: Error-Specific Validation

#### **Type A (Syntax/Language)**: Immediate Validation
- Syntax/linting verification
- Type checking compilation
- Import resolution testing
- Basic functionality tests

#### **Type B (Runtime/Logic)**: Comprehensive Testing
- Unit test execution
- Edge case validation
- State management verification
- Async operation testing

#### **Type C (System/Infrastructure)**: Environment Validation
- Service connectivity checks
- Configuration verification
- Resource availability testing
- Monitoring and alerting validation

#### **Type D (Integration/Architecture)**: System-Wide Testing
- End-to-end workflow testing
- Performance benchmarking
- Stress testing under load
- Integration point validation

## Advanced Features

### Error Context Enhancement
Users can provide additional context for better diagnosis:
```
/fix "TypeError: Cannot read property 'map' of undefined" --context=React component --file=UserList.tsx --line=23
/fix "Connection refused" --context=Docker compose --service=neo4j --port=7687
/fix "Module not found" --context=Python pytest --requirements=tests.txt
```

### Error Severity Specification
Users can specify error urgency:
```
/fix "Build failed" --severity=critical --deadline=immediate
/fix "Memory leak detected" --severity=high --impact=production
/fix "Linting warnings" --severity=low --impact=development-only
```

### Error Pattern Recognition
The command provides detailed error analysis:
```
Error Analysis: TypeError (Type A - Syntax/Language)
Root Cause: Attempting to map undefined value in React component
Affected Files: UserList.tsx:23, userService.ts:45
Fix Strategy: Add null check and optional chaining
Estimated Fix Time: 5 minutes
```

### Error Prevention Recommendations
After fixing, the command suggests prevention strategies:
- Code linting rules to catch similar errors
- Unit test scenarios to prevent regressions
- Code review checklist items
- Monitoring and alerting setup

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

### Example 1: Quick Syntax Error Fix (Type A)
```
User: /fix "TypeError: Cannot read property 'map' of undefined" in UserList component
```
**Process:**
1. **Analysis**: Type A error - undefined reference in React component
2. **Diagnosis**: Missing null check before array mapping
3. **Execution**: Add optional chaining and default empty array
4. **Validation**: Component renders without error, tests pass

### Example 2: Database Connection Error (Type C)
```
User: /fix "Connection refused" when connecting to Neo4j at localhost:7687
```
**Process:**
1. **Analysis**: Type C error - infrastructure connectivity issue
2. **Diagnosis**: Neo4j service not running or wrong port configuration
3. **Execution**: Check Docker containers, verify environment variables, restart services
4. **Validation**: Connection established, health checks pass

### Example 3: Async Logic Error (Type B)
```
User: /fix "Promise rejected" in file upload handler with race condition
```
**Process:**
1. **Analysis**: Type B error - async/await logic issue
2. **Diagnosis**: Missing error handling and concurrent file access
3. **Execution**: Add proper error boundaries and implement file locking
4. **Validation**: Upload tests pass, concurrent uploads handled correctly

### Example 4: Memory Leak Investigation (Type D)
```
User: /fix "Memory leak detected" in long-running document processing service
```
**Process:**
1. **Analysis**: Type D error - architecture/system issue
2. **Diagnosis**: Unclosed database connections and retained references
3. **Execution**: Refactor connection pooling, add cleanup methods, implement monitoring
4. **Validation**: Memory profiling shows stable usage, stress tests pass

## Error Handling and Fallbacks

### Error Classification Failures
- Default to Type B (Runtime/Logic) analysis for ambiguous errors
- Request user clarification for unclear error messages
- Use stack trace analysis when error type is unclear

### Fix Execution Failures
- Implement temporary workarounds when permanent fixes are complex
- Provide multiple solution approaches with trade-off analysis
- Escalate to higher error types if initial fix attempts fail

### Validation Failures
- Manual testing guidance when automated tests are unavailable
- User acceptance criteria for complex error fixes
- Monitoring setup recommendations for ongoing error detection

## Success Metrics

### Error Resolution Tracking
- First-time fix rate by error type (A, B, C, D)
- Time to resolution by error category
- Error recurrence rates after fixes
- User satisfaction with fix effectiveness

### Prevention Effectiveness
- Reduction in similar error occurrences over time
- Code quality improvements from implemented fixes
- System stability improvements from infrastructure fixes
- Architecture robustness improvements from design fixes

This specialized error-fixing command provides targeted, efficient solutions for software errors of all types, ensuring quick resolution for simple issues while providing comprehensive analysis for complex systemic problems.