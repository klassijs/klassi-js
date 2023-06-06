// @ts-ignore
import { default as _Cli } from './cli';
// @ts-ignore
import * as cliHelpers from './cli/helpers';
// @ts-ignore
import * as formatterHelpers from './formatter/helpers';
// @ts-ignore
import { default as _PickleFilter } from './pickle_filter';
// @ts-ignore
import * as parallelCanAssignHelpers from './support_code_library_builder/parallel_can_assign_helpers';
// @ts-ignore
import { default as _Runtime } from './runtime';
import * as messages from '@cucumber/messages';
// @ts-ignore
export declare const After: (<WorldType = import("./support_code_library_builder/world").IWorld<any>>(code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType>) => void) & (<WorldType_1 = import("./support_code_library_builder/world").IWorld<any>>(tags: string, code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType_1>) => void) & (<WorldType_2 = import("./support_code_library_builder/world").IWorld<any>>(options: import("./support_code_library_builder/types").IDefineTestCaseHookOptions, code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType_2>) => void);
// @ts-ignore
export declare const AfterAll: ((code: Function) => void) & ((options: import("./support_code_library_builder/types").IDefineTestRunHookOptions, code: Function) => void);
// @ts-ignore
export declare const AfterStep: (<WorldType = import("./support_code_library_builder/world").IWorld<any>>(code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType>) => void) & (<WorldType_1 = import("./support_code_library_builder/world").IWorld<any>>(tags: string, code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType_1>) => void) & (<WorldType_2 = import("./support_code_library_builder/world").IWorld<any>>(options: import("./support_code_library_builder/types").IDefineTestStepHookOptions, code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType_2>) => void);
// @ts-ignore
export declare const Before: (<WorldType = import("./support_code_library_builder/world").IWorld<any>>(code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType>) => void) & (<WorldType_1 = import("./support_code_library_builder/world").IWorld<any>>(tags: string, code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType_1>) => void) & (<WorldType_2 = import("./support_code_library_builder/world").IWorld<any>>(options: import("./support_code_library_builder/types").IDefineTestCaseHookOptions, code: import("./support_code_library_builder/types").TestCaseHookFunction<WorldType_2>) => void);
// @ts-ignore
export declare const BeforeAll: ((code: Function) => void) & ((options: import("./support_code_library_builder/types").IDefineTestRunHookOptions, code: Function) => void);
// @ts-ignore
export declare const BeforeStep: (<WorldType = import("./support_code_library_builder/world").IWorld<any>>(code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType>) => void) & (<WorldType_1 = import("./support_code_library_builder/world").IWorld<any>>(tags: string, code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType_1>) => void) & (<WorldType_2 = import("./support_code_library_builder/world").IWorld<any>>(options: import("./support_code_library_builder/types").IDefineTestStepHookOptions, code: import("./support_code_library_builder/types").TestStepHookFunction<WorldType_2>) => void);
// @ts-ignore
export declare const defineParameterType: (options: import("./support_code_library_builder/types").IParameterTypeDefinition<any>) => void;
// @ts-ignore
export declare const Given: import("./support_code_library_builder/types").IDefineStep;
export declare const setDefaultTimeout: (milliseconds: number) => void;
export declare const setDefinitionFunctionWrapper: (fn: Function) => void;
export declare const setWorldConstructor: (fn: any) => void;
// @ts-ignore
export declare const setParallelCanAssign: (fn: import("./support_code_library_builder/types").ParallelAssignmentValidator) => void;
// @ts-ignore
export declare const Then: import("./support_code_library_builder/types").IDefineStep;
// @ts-ignore
export declare const When: import("./support_code_library_builder/types").IDefineStep;
// @ts-ignore
export { default as World, IWorld, IWorldOptions, } from './support_code_library_builder/world';
export { parallelCanAssignHelpers };
// @ts-ignore
export { ITestCaseHookParameter, ITestStepHookParameter, } from './support_code_library_builder/types';
export declare const Status: typeof messages.TestStepResultStatus;
// @ts-ignore
export { wrapPromiseWithTimeout } from './time';
export declare const Runtime: typeof _Runtime;
// @ts-ignore
export { INewRuntimeOptions, IRuntimeOptions } from './runtime';
