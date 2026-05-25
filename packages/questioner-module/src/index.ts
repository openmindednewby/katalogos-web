import type { Module } from '@baseclient/core';

export const QUESTIONER_MODULE_NAME = 'questioner';

/**
 * Questioner Module - Quiz/Survey Management
 *
 * Required service: QuestionerService (port 5004)
 *
 * Features:
 * - Quiz template management (create, edit, activate)
 * - Quiz submission and completion
 * - Quiz answers/responses viewing and export
 */
export const questionerModule: Module = {
  name: QUESTIONER_MODULE_NAME,
  displayName: 'Questioner',
  requiredService: 'questioner',
  sidebarItems: [
    {
      key: 'quiz-templates',
      labelKey: 'menu.quizTemplates',
      route: '/quiz-templates',
      icon: 'document',
      requiredRoles: ['admin', 'superUser'],
      order: 30,
    },
    {
      key: 'quiz-answers',
      labelKey: 'menu.quizAnswers',
      route: '/quiz-answers',
      icon: 'checkmark',
      requiredRoles: ['admin', 'superUser'],
      order: 40,
    },
    {
      key: 'quiz-active',
      labelKey: 'menu.quizActive',
      route: '/quiz-active',
      icon: 'memo',
      requiredRoles: ['admin', 'superUser'],
      order: 50,
    },
  ],
  routes: [],
};

export default questionerModule;
