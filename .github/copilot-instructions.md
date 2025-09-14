````markdown
# Copilot Instructions

## Project Scope

- **Project**: Online web application for showcasing Computer Science capstone projects.
- **Tech Stack**: MERN (MongoDB, Express, React, Node.js) with **Mongoose**. Prefer **TypeScript** unless specified otherwise.
- **MVP Features**:
   - Public gallery of student projects (searchable, paginated, visually appealing).
   - Student login: submit/edit project details with media.
   - Visitor login: leave comments and like/bookmark projects.
   - Teaching team login: award badges, moderate content.
   - Deployment on **AWS**.
- **Future Features**:
   - Student profiles with skills/interests.
   - Team formation tools.
   - Project tags, categories, and filters.
   - Analytics dashboard.

## Roles & Permissions

### Visitor (not logged in)

- View projects, student profiles, and team profiles
- Search projects and students

### Logged-in (University emails & other emails not on list)

- All visitor rights
- Comment on projects
- Like projects
- Save projects

### Capstone Students

- All logged-in rights
- Upload project
- Edit their own project
- Get placed in their own team
- Edit profile

### Staff

- All capstone student rights
- Create, read, delete comments
- CRUD awards
- CRUD team list
- CRUD accounts
- CRUD projects

### Admin

- All staff rights
- CRUD team list
- CRUD all projects
- CRUD staff role

---

## Rules for Copilot

2. Default to **TypeScript** for backend and frontend. If JavaScript is requested, explain changes.
3. Write **clean, well-commented code** with explanations for design choices.
4. Use **ES Modules**, `async/await` if needed, and strong typing.
5. Follow this structure:
   - Backend: `models`, `controllers`, `services`, `routes`, `middleware`, `utils`.
   - Frontend: `components`, `pages`, `hooks`, `api`, `styles`.
6. Keep controllers thin. Business logic goes in services.
7. Implement **JWT authentication** with refresh tokens. Use bcrypt for password hashing.
8. Validate inputs with libraries like `joi`. Sanitize all user input.
9. Follow **role-based access control**: `student`, `visitor`, `staff`, `admin`, `capstoneStudent`.
10.   Provide **unit tests** (Jest, React Testing Library) for new features only when asked
11.   Use **AWS S3** for file uploads with presigned URLs when asked.
12.   Provide **Dockerfiles**, `docker-compose`, and GitHub Actions workflows for build/test/deploy when asked.
13.   Update `README.md` and add developer notes for every new feature when asked to
14.   Ensure accessibility (ARIA, keyboard navigation) and responsiveness in frontend components.

## Output Requirements

For every generated feature, Copilot must output: 2. Unit tests and sample data ONLY WHEN ASKED 3. README updates ONLY WHEN ASKED

# COPILOT EDITS OPERATIONAL GUIDELINES

 

## PRIME DIRECTIVE

 
Avoid working on more than one file at a time.
Multiple simultaneous edits to a file will cause corruption.
Be chatting and teach about what you are doing while coding.

 

## LARGE FILE & COMPLEX CHANGE PROTOCOL

 

### MANDATORY PLANNING PHASE

 
When working with large files (>300 lines) or complex changes:

 

1. ALWAYS start by creating a detailed plan BEFORE making any edits
2. Your plan MUST include:
      - All functions/sections that need modification
      - The order in which changes should be applied
      - Dependencies between changes
      - Estimated number of separate edits required
3. Format your plan as:

 

```markdown
## PROPOSED EDIT PLAN

 
Working with: [filename]
Total planned edits: [number]
```
````

 

### MAKING EDITS

 

- Focus on one conceptual change at a time
- Show clear "before" and "after" snippets when proposing changes
- Include concise explanations of what changed and why
- Always check if the edit maintains the project's coding style

 

### Edit sequence:

 

1. [First specific change] - Purpose: [why]
2. [Second specific change] - Purpose: [why]
3. Do you approve this plan? I'll proceed with Edit [number] after your confirmation.
4. WAIT for explicit user confirmation before making ANY edits when user ok edit [number]

 

### EXECUTION PHASE

 

- After each individual edit, clearly indicate progress:
    "✅ Completed edit [#] of [total]. Ready for next edit?"
- If you discover additional needed changes during editing:
- STOP and update the plan
- Get approval before continuing

 

### REFACTORING GUIDANCE

 
When refactoring large files:

 

- Break work into logical, independently functional chunks
- Ensure each intermediate state maintains functionality
- Consider temporary duplication as a valid interim step
- Always indicate the refactoring pattern being applied

 

### RATE LIMIT AVOIDANCE

 

- For very large files, suggest splitting changes across multiple sessions
- Prioritize changes that are logically complete units
- Always provide clear stopping points

 

## General Requirements

 
Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments.

 

### Accessibility

 

- Ensure compliance with **WCAG 2.1** AA level minimum, AAA whenever feasible.
- Always suggest:
- Labels for form fields.
- Proper **ARIA** roles and attributes.
- Adequate color contrast.
- Alternative texts (`alt`, `aria-label`) for media elements.
- Semantic HTML for clear structure.
- Tools like **Lighthouse** for audits.

 

## Browser Compatibility

 

- Prioritize feature detection (`if ('fetch' in window)` etc.).
- Support latest two stable releases of major browsers:
- Firefox, Chrome, Edge, Safari (macOS/iOS)
- Emphasize progressive enhancement with polyfills or bundlers (e.g., **Babel**, **Vite**) as needed.

 

## HTML/CSS Requirements

 

- **HTML**:
- Use HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<search>`, etc.)
- Include appropriate ARIA attributes for accessibility
- Ensure valid markup that passes W3C validation
- Use responsive design practices
- Optimize images using modern formats (`WebP`, `AVIF`)
- Include `loading="lazy"` on images where applicable
- Generate `srcset` and `sizes` attributes for responsive images when relevant
- Prioritize SEO-friendly elements (`<title>`, `<meta description>`, Open Graph tags)

- **CSS**:
- We are using **Material UI** (@mui/material) so prioritize using the components provided by the library
- When available, use classes provided by the library instead of custom styles
- Use modern CSS features including:
- CSS Grid and Flexbox for layouts
- CSS Custom Properties (variables)
- CSS animations and transitions
- Media queries for responsive design
- Logical properties (`margin-inline`, `padding-block`, etc.)
- Modern selectors (`:is()`, `:where()`, `:has()`)
- Use CSS nesting where appropriate
- Include dark mode support with `prefers-color-scheme`
- Prioritize modern, performant fonts and variable fonts for smaller file sizes
- Use modern units (`rem`, `vh`, `vw`) instead of traditional pixels (`px`) for better responsiveness

 

## JavaScript / TypeScript Requirements

 

- **Minimum Compatibility**: ECMAScript 2020 (ES11) or higher
- **Features to Use**:
    - Arrow functions
    - Template literals
    - Destructuring assignment
    - Spread/rest operators
    - Async/await for asynchronous code
    - Classes with proper inheritance when OOP is needed
    - Object shorthand notation
    - Optional chaining (`?.`)
    - Nullish coalescing (`??`)
    - Dynamic imports
    - BigInt for large integers
    - `Promise.allSettled()`
    - `String.prototype.matchAll()`
    - `globalThis` object
    - Private class fields and methods
    - Export \* as namespace syntax
    - Array methods (`map`, `filter`, `reduce`, `flatMap`, etc.)
- **Avoid**:
    - `var` keyword (use `const` and `let`)
    - jQuery or any external libraries
    - Callback-based asynchronous patterns when promises can be used
    - Internet Explorer compatibility
    - Legacy module formats (use ES modules)
    - Limit use of `eval()` due to security risks
- **Performance Considerations:**
    - Recommend code splitting and dynamic imports for lazy loading
    - Verify if non dependant await can be parallelized
- **Error Handling**:
    - Use `try-catch` blocks **consistently** for asynchronous and API calls, and handle promise rejections explicitly.
    - Differentiate among:
      - **Network errors** (e.g., timeouts, server errors, rate-limiting)
      - **Functional/business logic errors** (logical missteps, invalid user input, validation failures)
      - **Runtime exceptions** (unexpected errors such as null references)
    - Provide **user-friendly** error messages (e.g., “Something went wrong. Please try again shortly.”) and log more technical details to dev/ops (e.g., via a logging service).
    - Consider a central error handler function (like `useErrorBoundary` from React) or global event (e.g., `window.addEventListener('unhandledrejection')`) to consolidate reporting.
    - Carefully handle and validate JSON responses, incorrect HTTP status codes, etc.

- When writing api's in the frontend, ensure the return types are well defined and documented and match the backend api's

## Documentation Requirements

 

- Include JSDoc comments for JavaScript/TypeScript. DON'T INCLUDE @author don't include author
- Document complex functions with clear examples.
- Maintain concise Markdown documentation.
- Minimum docblock info: `param`, `return`, `throws`, `author`

 

## Security Considerations

 

- Sanitize all user inputs thoroughly.
- Parameterize database queries.
- Enforce strong Content Security Policies (CSP).
- Use CSRF protection where applicable.
- Ensure secure cookies (`HttpOnly`, `Secure`, `SameSite=Strict`).
- Limit privileges and enforce role-based access control.
- Implement detailed internal logging and monitoring.

Don't include a file path header in the beginning of files
