import produce from "immer";
import isEqual from "lodash/isEqual";
import { useContext, useEffect, useMemo, useState } from "react";
import { previewContentEditable } from "../../../components/ContentEditable/ContentEditable";
import { SettingsContext } from "../../../contexts/SettingsContext/SettingsContext";
import { CharacterFactory } from "../../../domains/character/CharacterFactory";
import { CharacterTemplates } from "../../../domains/character/CharacterType";
import {
  BlockType,
  IBlock,
  ICharacter,
  IPage
} from "../../../domains/character/types";
import { getUnix, getUnixFrom } from "../../../domains/dayjs/getDayJS";
import { Id } from "../../../domains/Id/Id";

export function useCharacter(characterFromProps?: ICharacter | undefined) {
  const settingsManager = useContext(SettingsContext);

  const [character, setCharacter] = useState<ICharacter | undefined>(
    characterFromProps
  );

  const dirty = useMemo(() => {
    return !isEqual(characterFromProps, character);
  }, [characterFromProps, character]);

  useEffect(() => {
    const characterFromPropsLastUpdated = getUnixFrom(
      characterFromProps?.lastUpdated ?? 0
    );
    const currentCharacterLastUpdated = getUnixFrom(
      character?.lastUpdated ?? 0
    );

    const isDifferentCharacter = characterFromProps?.id !== character?.id;
    const isOutdated =
      characterFromPropsLastUpdated > currentCharacterLastUpdated;

    if (isDifferentCharacter || isOutdated) {
      setCharacter(characterFromProps);
    }
  }, [characterFromProps]);

  async function loadTemplate(type: CharacterTemplates) {
    const defaultCharacter = await CharacterFactory.make(type);

    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const id = draft.id;
        const name = draft.name || defaultCharacter.name;
        const group = draft.group || defaultCharacter.group;

        return {
          ...defaultCharacter,
          id: id,
          name: name,
          group: group,
          lastUpdated: getUnix(),
        };
      })
    );
  }

  function setName(newName: string) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.name = newName;
      })
    );
  }

  function setGroup(newGroup: string | null | undefined) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.group = newGroup as string | undefined;
      })
    );
  }

  function addPage() {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const newPage: IPage = {
          id: Id.generate(),
          sections: [],
          label: "Page",
        };
        draft.pages.push(newPage);
      })
    );
  }

  function removePage(pageIndex: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages = draft.pages.filter((p, index) => index !== pageIndex);
      })
    );
  }

  function renamePage(pageIndex: number, value: string) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].label = value;
      })
    );
  }

  function addSection(pageIndex: number, sectionIndex: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        draft.pages[pageIndex].sections.splice(sectionIndex + 1, 0, {
          id: Id.generate(),
          label: "Section",
          blocks: [],
        });
      })
    );
  }

  function renameSection(
    pageIndex: number,

    sectionIndex: number,
    label: string
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections[sectionIndex].label = label;
      })
    );
  }

  function toggleSectionVisibleOnCard(
    pageIndex: number,

    sectionIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const oldValue =
          draft.pages[pageIndex].sections[sectionIndex].visibleOnCard;
        draft.pages[pageIndex].sections[sectionIndex].visibleOnCard = !oldValue;
      })
    );
  }

  function movePage(pageIndex: number, direction: "up" | "down") {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages = moveValueInList(draft.pages, pageIndex, direction);
      })
    );
  }

  function repositionSection(pageIndex: number, sectionIndex: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        // if (sectionLocation === "left") {
        //   const [sectionToMove] = draft.pages[pageIndex].sections.left.splice(
        //     sectionIndex,
        //     1
        //   );
        //   draft.pages[pageIndex].sections.right.push(sectionToMove);
        // } else {
        //   const [sectionToMove] = draft.pages[pageIndex].sections.right.splice(
        //     sectionIndex,
        //     1
        //   );
        //   draft.pages[pageIndex].sections.left.push(sectionToMove);
        // }
      })
    );
  }
  function moveSectionInPage(
    pageIndex: number,

    sectionIndex: number,
    newPageIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const [section] = draft.pages[pageIndex].sections.splice(
          sectionIndex,
          1
        );
        draft.pages[newPageIndex].sections.push(section);
      })
    );
  }

  function moveSection(
    pageIndex: number,

    sectionIndex: number,
    direction: "up" | "down"
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections = moveValueInList(
          draft.pages[pageIndex].sections,
          sectionIndex,
          direction
        );
      })
    );
  }

  function removeSection(
    pageIndex: number,

    sectionIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections = draft.pages[
          pageIndex
        ].sections.filter((a, index) => {
          return index !== sectionIndex;
        });
      })
    );
  }

  function addBlock(
    pageIndex: number,

    sectionIndex: number,
    type: BlockType
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections[sectionIndex].blocks.push(
          CharacterFactory.makeBlock(type, {
            defaultCommands: settingsManager.state.diceCommandIds,
          })
        );
      })
    );
  }

  function duplicatePage(pageIndex: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const pageToDuplicate = draft.pages[pageIndex];
        draft.pages.splice(
          pageIndex + 1,
          0,
          CharacterFactory.duplicatePage(pageToDuplicate)
        );
      })
    );
  }

  function duplicateSection(
    pageIndex: number,

    sectionIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const sectionToDuplicate =
          draft.pages[pageIndex].sections[sectionIndex];

        draft.pages[pageIndex].sections.splice(
          sectionIndex + 1,
          0,
          CharacterFactory.duplicateSection(sectionToDuplicate)
        );
      })
    );
  }

  function duplicateBlock(
    pageIndex: number,

    sectionIndex: number,
    blockIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const blockToDuplicate =
          draft.pages[pageIndex].sections[sectionIndex].blocks[blockIndex];

        draft.pages[pageIndex].sections[sectionIndex].blocks.splice(
          blockIndex + 1,
          0,
          CharacterFactory.duplicateBlock(blockToDuplicate)
        );
      })
    );
  }

  function moveDnDSection(
    pageIndex: number,

    dragIndex: number,
    hoverIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        if (dragIndex === undefined || hoverIndex === undefined) {
          return;
        }

        const dragItem = draft.pages[pageIndex].sections[dragIndex];

        draft.pages[pageIndex].sections.splice(dragIndex, 1);
        draft.pages[pageIndex].sections.splice(hoverIndex, 0, dragItem);
      })
    );
  }

  function moveDnDBlock(
    pageIndex: number,

    sectionIndex: number,
    dragIndex: number,
    hoverIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        if (dragIndex === undefined || hoverIndex === undefined) {
          return;
        }

        const dragItem =
          draft.pages[pageIndex].sections[sectionIndex].blocks[dragIndex];

        draft.pages[pageIndex].sections[sectionIndex].blocks.splice(
          dragIndex,
          1
        );
        draft.pages[pageIndex].sections[sectionIndex].blocks.splice(
          hoverIndex,
          0,
          dragItem
        );
      })
    );
  }

  function setBlock(
    pageIndex: number,

    sectionIndex: number,
    blockIndex: number,
    block: IBlock
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections[sectionIndex].blocks[blockIndex] =
          block;
      })
    );
  }

  function setBlockMeta(
    pageIndex: number,

    sectionIndex: number,
    blockIndex: number,
    meta: any
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        draft.pages[pageIndex].sections[sectionIndex].blocks[blockIndex].meta =
          meta;
      })
    );
  }

  function toggleBlockMainPointCounter(blockId: string) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        for (const page of draft.pages) {
          for (const section of page.sections) {
            for (const block of section.blocks) {
              const match = block.id === blockId;

              if (block.type === BlockType.PointCounter) {
                if (match) {
                  block.meta.isMainPointCounter =
                    !block.meta.isMainPointCounter;
                } else {
                  block.meta.isMainPointCounter = false;
                }
              }
            }
          }
        }
      })
    );
  }

  function toggleSectionWidth(pageIndex: number, sectionIndex: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        const section = draft.pages[pageIndex].sections[sectionIndex];
        const shouldUseHalfWidth = section.width == null || section.width === 1;
        const newWidth = shouldUseHalfWidth ? 0.5 : 1;

        section.width = newWidth;
      })
    );
  }

  function removeBlock(
    pageIndex: number,

    sectionIndex: number,
    blockIndex: number
  ) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }
        draft.pages[pageIndex].sections[sectionIndex].blocks = draft.pages[
          pageIndex
        ].sections[sectionIndex].blocks.filter((field, index) => {
          return index !== blockIndex;
        });
      })
    );
  }

  function getCharacterWithNewTimestamp() {
    const updatedCharacter = produce(character!, (draft) => {
      if (!draft) {
        return;
      }
      draft.name = previewContentEditable({ value: draft.name });
      draft.lastUpdated = getUnix();
    });
    return updatedCharacter;
  }

  function toggleWideMode() {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        draft.wide = draft.wide == null ? true : !draft.wide;
      })
    );
  }

  function setZoom(zoom: number) {
    setCharacter(
      produce((draft: ICharacter | undefined) => {
        if (!draft) {
          return;
        }

        draft.zoom = zoom;
      })
    );
  }

  return {
    state: { character, dirty },
    actions: {
      loadTemplate,
      setName,
      setGroup,
      addPage,
      renamePage,
      removePage,
      addSection,
      renameSection,
      toggleSectionVisibleOnCard,
      moveSection,
      repositionSection,
      movePage,
      moveSectionInPage,
      removeSection,
      addBlock,
      duplicateBlock,
      duplicatePage,
      duplicateSection,
      moveDnDSection,
      moveDnDBlock,
      setBlock,
      setBlockMeta,
      toggleBlockMainPointCounter,
      removeBlock,
      getCharacterWithNewTimestamp,
      toggleWideMode,
      setZoom,
      toggleSectionWidth,
    },
  };
}

export function moveValueInList<T>(
  list: Array<T>,
  index: number,
  direction: "up" | "down"
) {
  if (direction === "up") {
    return moveUp(list, index);
  }
  if (direction === "down") {
    return moveDown(list, index);
  }
  return list;
}

function moveUp<T>(list: Array<T>, index: number) {
  if (index === 0) {
    return list;
  }
  const newIndex = index - 1;
  const element = list[index];
  const swap = list[newIndex];

  return list.map((el, i) => {
    if (i === index) {
      return swap;
    }
    if (i === newIndex) {
      return element;
    }
    return el;
  });
}

function moveDown<T>(list: Array<T>, index: number) {
  if (index === list.length - 1) {
    return list;
  }

  const newIndex = index + 1;
  const element = list[index];
  const swap = list[newIndex];

  return list.map((el, i) => {
    if (i === index) {
      return swap;
    }
    if (i === newIndex) {
      return element;
    }
    return el;
  });
}
