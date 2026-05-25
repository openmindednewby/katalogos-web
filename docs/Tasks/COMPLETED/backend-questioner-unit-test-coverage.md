# Task: Improve Questioner Service Unit Test Coverage

## Status: IN PROGRESS
## Date: 2026-03-14

## Problem Statement
The Questioner service has the lowest test coverage at 21.7% line coverage (289/1,329 lines) with only 16 tests. The target is 50%+ line and branch coverage.

## Approach
1. Write tests for all untested use case handlers (QuestionerTemplate and CompletedQuestioner)
2. Write tests for domain entity behavior (BaseQuestioner, QuestionerTemplate, CompletedQuestioner, QuestionerContents)
3. Write tests for mappers (QuestionerTemplateMapper, CompletedQuestionerMapper, KeycloakIdentityUserMapper)
4. Write tests for specifications (InactiveQuestionerTemplatesSpec)
5. Follow existing test patterns: NSubstitute for mocking, Shouldly for assertions, xUnit, AAA pattern

## Files to Create
- UseCases/QuestionerTemplate/UpdateQuestionerTemplateHandlerTests.cs
- UseCases/QuestionerTemplate/GetQuestionerTemplateHandlerTests.cs
- UseCases/QuestionerTemplate/ListQuestionerTemplatesHandlerTests.cs
- UseCases/QuestionerTemplate/ActivateTemplateHandlerTests.cs
- UseCases/QuestionerTemplate/DeleteInactiveTemplatesHandlerTests.cs
- UseCases/QuestionerTemplate/GetActiveQuestionerTemplateHandlerTests.cs
- UseCases/CompletedQuestioner/CreateCompletedQuestionerHandlerTests.cs
- UseCases/CompletedQuestioner/DeleteCompletedQuestionerHandlerTests.cs
- UseCases/CompletedQuestioner/GetCompletedQuestionerHandlerTests.cs
- UseCases/CompletedQuestioner/GetByUserIdCompletedQuestionerHandlerTests.cs
- UseCases/CompletedQuestioner/ListCompletedQuestionersHandlerTests.cs
- UseCases/CompletedQuestioner/UpdateCompletedQuestionerHandlerTests.cs
- Core/Domain/QuestionerTemplateTests.cs
- Core/Domain/CompletedQuestionerTests.cs
- Core/Domain/QuestionerContentsTests.cs
- Core/Domain/BaseTenantEntityTests.cs
- Mappers/QuestionerTemplateMapperTests.cs
- Mappers/CompletedQuestionerMapperTests.cs
- Mappers/KeycloakIdentityUserMapperTests.cs
- Core/Specifications/InactiveQuestionerTemplatesSpecTests.cs

## Success Criteria
- 50%+ line coverage
- 50%+ branch coverage
- 80+ total tests
- All tests pass
