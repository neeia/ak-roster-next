import React, { useEffect } from "react";
import { defaultOperatorObject, Operator, OpJsonObj, LegacyOperator, } from '../types/operator';
import operatorJson from "../data/operators.json";
import useLocalStorage from './useLocalStorage';
import changeOperator from './changeOperator';
import { isUndefined } from "util";

const orderOfOperations = [
  "owned",
  "favorite",
  "potential",
  "promotion",
  "level",
  "skillLevel",
];


// Converts a LegacyOperator into an Operator
function convertLegacy([_, op]: [any, LegacyOperator]): [string, Operator] {
  const newMastery = [];
  if (op.skill1Mastery) newMastery[0] = op.skill1Mastery;
  if (op.skill2Mastery) newMastery[1] = op.skill2Mastery;
  if (op.skill3Mastery) newMastery[2] = op.skill3Mastery;
  return [
    op.id,
    {
      id: op.id,
      name: op.name,
      favorite: op.favorite,
      rarity: op.rarity,
      potential: op.potential,
      promotion: op.promotion,
      owned: op.owned,
      level: op.level,
      skillLevel: op.skillLevel,
      mastery: newMastery,
      module: op.module ?? [],
    },
  ];
}

function useOperators() {
  const defaultOperators = Object.fromEntries(
    Object.entries(operatorJson).map(defaultOperatorObject)
  );
  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>("operators", defaultOperators);


  const onChange = (operatorID: string, property: string, value: number | boolean, index?: number) => {
    if (isNaN(value as any)) {
      return;
    }
    setOperators(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        const copyOperatorData = { ...copyOperators[operatorID] };
        copyOperators[operatorID] = changeOperator(copyOperatorData, property, value, index);
        return copyOperators;
      }
    );
  }
  const applyBatch = React.useCallback(
    (source: Operator, target: string[]) => {
      setOperators(
        (oldOperators: Record<string, Operator>): Record<string, Operator> => {
          const copyOperators = { ...oldOperators };
          target.forEach((opId: string) => {
            var copyOperatorData = { ...copyOperators[opId] };
            orderOfOperations.forEach((prop: string) =>
              copyOperatorData = changeOperator(copyOperatorData, prop, (source as any)[prop])
            )
            source.mastery.forEach((index: number) =>
              copyOperatorData = changeOperator(copyOperatorData, "mastery", source.mastery[index], index)
            )
            source.module.forEach((index: number) =>
              copyOperatorData = changeOperator(copyOperatorData, "module", source.module[index], index)
            )
            copyOperators[opId] = copyOperatorData;
          })
          return copyOperators;
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setOperators]
  );

  Object.entries(operatorJson).forEach((props: [opId: string, opJ: OpJsonObj]) => {
    const [opId] = props;
    const op = operators[opId];
    
    // check for missing operators to repair
    if (!op || !op.name || !op.id) {
      const opJsonItem = operatorJson[opId as keyof typeof operatorJson];
      if (opJsonItem)
        setOperators((oldOperators: Record<string, Operator>): Record<string, Operator> => {
          const copyOperators = { ...oldOperators };
          copyOperators[opId] = defaultOperatorObject([opId, opJsonItem])[1];
          return copyOperators;
        });
    }
    // check for outdated operators to redefine
    else if (!isUndefined((op as any)["skill1Mastery"])) {
      const newOps = Object.fromEntries(Object.entries(operators).map(convertLegacy));
      setOperators(newOps);
    }
  });

  return [operators, onChange, applyBatch] as const
}

export default useOperators;