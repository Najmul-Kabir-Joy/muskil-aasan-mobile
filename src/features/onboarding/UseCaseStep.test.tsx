import { fireEvent, render } from "@testing-library/react-native";
import { useState } from "react";
import { PrimaryUseCase, UseCaseStep } from "./UseCaseStep";

function ControlledUseCaseStep() {
  const [useCase, setUseCase] = useState<PrimaryUseCase>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  return (
    <UseCaseStep
      useCase={useCase}
      onChangeUseCase={setUseCase}
      selectedCategories={selectedCategories}
      onToggleCategory={(id) =>
        setSelectedCategories((current) =>
          current.includes(id)
            ? current.filter((c) => c !== id)
            : current.length >= 5
              ? current
              : [...current, id],
        )
      }
    />
  );
}

describe("UseCaseStep", () => {
  it("does not show categories until Job Seeker is selected", async () => {
    const { queryByText } = await render(<ControlledUseCaseStep />);
    expect(queryByText(/Pick up to 5 categories/)).toBeNull();
  });

  it("selecting Job Provider does not reveal categories", async () => {
    const { getByRole, queryByText } = await render(<ControlledUseCaseStep />);
    await fireEvent.press(getByRole("button", { name: /I need help/ }));
    expect(queryByText(/Pick up to 5 categories/)).toBeNull();
  });

  it("selecting a card twice deselects it", async () => {
    const { getByRole } = await render(<ControlledUseCaseStep />);
    const seekerCard = getByRole("button", { name: /I'd like to help/ });

    await fireEvent.press(seekerCard);
    expect(seekerCard.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );

    await fireEvent.press(seekerCard);
    expect(seekerCard.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("selecting the other card switches selection", async () => {
    const { getByRole } = await render(<ControlledUseCaseStep />);
    const providerCard = getByRole("button", { name: /I need help/ });
    const seekerCard = getByRole("button", { name: /I'd like to help/ });

    await fireEvent.press(providerCard);
    await fireEvent.press(seekerCard);

    expect(providerCard.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
    expect(seekerCard.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("'I'm not sure yet' clears the selected card and hides categories", async () => {
    const { getByRole, queryByText } = await render(<ControlledUseCaseStep />);
    const seekerCard = getByRole("button", { name: /I'd like to help/ });

    await fireEvent.press(seekerCard);
    expect(queryByText(/Pick up to 5 categories/)).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "I'm not sure yet" }));

    expect(seekerCard.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
    expect(queryByText(/Pick up to 5 categories/)).toBeNull();
  });
});
