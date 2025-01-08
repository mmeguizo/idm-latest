import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'abbreviation',
})
export class AbbreviationPipe implements PipeTransform {
    transform(value: number, type: 'number' | 'percentage'): string {
        if (type === 'number') {
            if (value >= 1_000_000) {
                return (value / 1_000_000).toFixed(1) + 'M';
            } else if (value >= 1_000) {
                return (value / 1_000).toFixed(1) + 'k';
            } else {
                return value.toString();
            }
        } else if (type === 'percentage') {
            return value + '%';
        }
        return value.toString();
    }
}

@Pipe({
    name: 'abbreviatePercentage',
})
export class AbbreviatePercentagePipe implements PipeTransform {
    transform(value: number): string {
        return value + '%';
    }
}
@Pipe({
    name: 'firstFourWords',
})
export class FirstFourWordsPipe implements PipeTransform {
    transform(value: string): string {
        const words = value.split(' ');
        return words.slice(0, 4).join(' ') + '...';
    }
}

@Pipe({
    name: 'objectiveNames',
})
export class ObjectiveNamesPipe implements PipeTransform {
    transform(goal: any): string {
        return (
            goal.objectivesDetails
                ?.filter((o) => o.functional_objective)
                .map((o) => o.functional_objective)
                .join(', ') || ''
        );
    }
}

@Pipe({
    name: 'completedObjectives',
})
export class CompletedObjectivesPipe implements PipeTransform {
    transform(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => o.complete && !o.deleted)
                .length || 0
        );
    }
}

@Pipe({
    name: 'incompleteObjectives',
})
export class IncompleteObjectivesPipe implements PipeTransform {
    transform(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => !o.complete && !o.deleted)
                .length || 0
        );
    }
}

@Pipe({
    name: 'formatFrequency',
})
export class FormatFrequencyPipe implements PipeTransform {
    transform(frequency: string): string {
        if (frequency === 'quarterly') {
            return 'Quarterly';
        } else if (frequency === 'yearly') {
            return 'Yearly';
        } else if (frequency === 'semi_annual') {
            return 'Semi-Annual';
        } else {
            return 'Monthly';
        }
    }
}
