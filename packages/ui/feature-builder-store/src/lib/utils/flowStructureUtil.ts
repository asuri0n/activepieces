import {
  ActionType,
  BranchAction,
  FlowVersion,
  LoopOnItemsAction,
  Trigger,
  flowHelper,
} from '@activepieces/shared';
import { FlowItem } from '../model/flow-item';

// TODO REMOVE THIS FILE AND REPLACE IT WITH FUNCTIONS IN flowHelper.ts
export class FlowStructureUtil {
  public static findAvailableName(
    flowVersion: FlowVersion,
    stepPrefix: string
  ) {
    const steps = flowHelper.getAllSteps(flowVersion.trigger);
    let number = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let exist = false;
      for (let i = 0; i < steps.length; ++i) {
        const step = steps[i];
        if (step.name === stepPrefix.toString().toLowerCase() + '_' + number) {
          exist = true;
          break;
        }
      }
      if (exist) {
        number++;
      } else {
        break;
      }
    }
    return stepPrefix.toString().toLowerCase() + '_' + number;
  }

  private static _findPathToStep(
    stepToFind: FlowItem,
    stepToSearch: FlowItem | undefined
  ): FlowItem[] | undefined {
    if (stepToSearch === undefined) {
      return undefined;
    }
    if (stepToFind.name === stepToSearch.name) {
      return [];
    }
    const pathFromNextAction = this._findPathToStep(
      stepToFind,
      stepToSearch.nextAction
    );
    if (pathFromNextAction) {
      if (
        stepToSearch.type !== ActionType.BRANCH &&
        stepToSearch.type !== ActionType.LOOP_ON_ITEMS
      ) {
        return [stepToSearch, ...pathFromNextAction];
      }
      return [...pathFromNextAction];
    }
    const pathFromTrueBranch = this._findPathToStep(
      stepToFind,
      (stepToSearch as BranchAction).onSuccessAction
    );
    if (pathFromTrueBranch) {
      return [...pathFromTrueBranch];
    }
    const pathFromFalseBranch = this._findPathToStep(
      stepToFind,
      (stepToSearch as BranchAction).onFailureAction
    );
    if (pathFromFalseBranch) {
      return [...pathFromFalseBranch];
    }
    const pathFromLoop = this._findPathToStep(
      stepToFind,
      (stepToSearch as LoopOnItemsAction).firstLoopAction
    );
    if (pathFromLoop) {
      return [stepToSearch, ...pathFromLoop];
    }

    return undefined;
  }

  public static findPathToStep(
    stepToFind: FlowItem,
    trigger: Trigger
  ): FlowItem[] {
    if (stepToFind.name === trigger.name) {
      return [];
    }
    const path = this._findPathToStep(stepToFind, trigger.nextAction);
    if (!path) {
      throw new Error('Step not found while traversing to find it ');
    }
    const pathWithIndex = path.map((f) => {
      return {
        ...f,
        indexInDfsTraversal: FlowStructureUtil.findStepIndex(trigger, f.name),
      };
    });
    return [trigger, ...pathWithIndex];
  }

  public static findStepIndex(trigger: Trigger, stepName: string) {
    return (
      flowHelper.getAllSteps(trigger).findIndex((f) => stepName === f.name) + 1
    );
  }
}
