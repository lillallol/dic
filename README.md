-   [Description](#description)
-   [Installation](#installation)
-   [Motivation](#motivation)
-   [Documentation](#documentation)
-   [Acknowledgments](#acknowledgments)
-   [License](#license)

## Description

A DIC (Dependency Injection Container) I made from scratch and use in my personal projects.

It has the following characteristics :

-   configuration as code (no auto-wiring)
-   only factory registrations
-   choice for singleton and transient lifecycle
-   interception
-   usage of ecmascript symbols instead of interfaces
-   inject manual concretions on object composition
-   state reset by discarding memoized concretions
-   un-register abstraction

## Installation

```bash
npm install @lillallol/dic
```

## Motivation

At first I made this DIC for learning purposes. Then I started to use it in my own projects for practice. Eventually I had to upload those projects in npm, and since they were using my DIC, I decided it would be less time consuming to upload the DIC as a module in npm, rather than refactor my projects to use another DIC from the npm registry.

## Documentation

For the time being the documentation is available by reading the JSDoc comments provided by intellisense from your IDE.

## Acknowledgments

The following resources had a detrimental role in the creation of this module:

-   [reliable javascript](https://www.amazon.com/Reliable-JavaScript-Safely-Dangerous-Language/dp/1119028728/ref=sr_1_1?dchild=1&keywords=reliable+javascript&qid=1603887365&sr=8-1)
-   [dependency injection](https://www.amazon.com/Dependency-Injection-Principles-Practices-Patterns/dp/161729473X/ref=sr_1_1?dchild=1&keywords=dependency+injection&qid=1603887468&sr=8-1)

## License

MIT
