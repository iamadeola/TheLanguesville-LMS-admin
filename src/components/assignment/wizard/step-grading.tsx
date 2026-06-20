"use client";

import { Box, Flex, Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { Cpu, List, Pencil, Plus, Trash2 } from "lucide-react";
import type { GradingMethod } from "@/lib/api/assignments";
import { SelectableCard } from "@/components/assignment/shared";
import { useWizard } from "./wizard-context";
import { Card, FieldLabel, StepHeading, TextField } from "./wizard-bits";

const METHODS: {
  value: GradingMethod;
  label: string;
  description: string;
  icon: typeof Pencil;
}[] = [
  { value: "manual", label: "Manual grading", description: "Grade submission by hand", icon: Pencil },
  { value: "automatic", label: "Automatic grading", description: "AI-assisted feedback", icon: Cpu },
  { value: "rubric", label: "Rubric-based", description: "Score against criteria", icon: List },
];

export function StepGrading() {
  const { draft, update, addCriterion, updateCriterion, removeCriterion, rubricTotal } =
    useWizard();
  const total = parseInt(draft.totalPoints, 10) || 0;
  const full = rubricTotal >= total && total > 0;

  return (
    <Stack gap={6}>
      <StepHeading
        title="Grading setup"
        subtitle="Define how this assignment will be scored."
      />

      <Card title="Grading method">
        <HStack gap={3} align="stretch">
          {METHODS.map((m) => (
            <SelectableCard
              key={m.value}
              icon={m.icon}
              label={m.label}
              description={m.description}
              selected={draft.gradingMethod === m.value}
              onClick={() => update({ gradingMethod: m.value })}
            />
          ))}
        </HStack>
      </Card>

      <Card title="Score settings">
        <Grid templateColumns="1fr 1fr" gap={4}>
          <Stack gap={0}>
            <FieldLabel>Total points</FieldLabel>
            <TextField
              type="number"
              value={draft.totalPoints}
              onChange={(e) => update({ totalPoints: e.target.value })}
            />
          </Stack>
          <Stack gap={0}>
            <FieldLabel>Passing score</FieldLabel>
            <TextField
              type="number"
              value={draft.passingScore}
              onChange={(e) => update({ passingScore: e.target.value })}
            />
          </Stack>
        </Grid>
      </Card>

      {draft.gradingMethod === "rubric" ? (
        <Card title="Rubric criteria">
          <Stack gap={3}>
            {draft.rubric.map((c) => (
              <HStack key={c.id} gap={3}>
                <TextField
                  flex="1"
                  value={c.name}
                  onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                />
                <TextField
                  type="number"
                  w="90px"
                  value={String(c.points)}
                  onChange={(e) =>
                    updateCriterion(c.id, { points: Number(e.target.value) || 0 })
                  }
                />
                <Flex
                  as="button"
                  onClick={() => removeCriterion(c.id)}
                  w="40px"
                  h="40px"
                  align="center"
                  justify="center"
                  color="#EF4444"
                  cursor="pointer"
                  rounded="md"
                  _hover={{ bg: "#FEE2E2" }}
                  flexShrink={0}
                >
                  <Trash2 size={18} />
                </Flex>
              </HStack>
            ))}

            <Flex justify="space-between" align="center">
              <Box
                as="button"
                onClick={full ? undefined : addCriterion}
                opacity={full ? 0.5 : 1}
                cursor={full ? "not-allowed" : "pointer"}
                borderWidth="1px"
                borderColor="gray.200"
                rounded="full"
                px={5}
                py={2.5}
                _hover={full ? undefined : { bg: "gray.50" }}
              >
                <HStack gap={2}>
                  <Plus size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Add criterion
                  </Text>
                </HStack>
              </Box>
              <Text fontSize="sm" color={rubricTotal === total ? "#16A34A" : "gray.500"} fontWeight="medium">
                Total: {rubricTotal} pts
              </Text>
            </Flex>
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
