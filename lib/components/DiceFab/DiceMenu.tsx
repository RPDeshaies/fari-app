import { css } from "@emotion/css";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { useTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import { useZIndex } from "../../constants/zIndex";
import { DiceContext } from "../../contexts/DiceContext/DiceContext";
import {
  CommmandSetOptions,
  IDiceCommandSetOption,
} from "../../domains/dice/Dice";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";

export function DiceMenu(props: {
  anchorEl: any;
  open: boolean;
  ctaLabel?: string;
  commands: Array<IDiceCommandSetOption>;
  showPoolToggle: boolean;
  onCtaClick?(): void;
  onClose?(): void;
  onClear?(): void;
  onDiceCommandChange: React.Dispatch<
    React.SetStateAction<IDiceCommandSetOption[]>
  >;
}) {
  const theme = useTheme();
  const zIndex = useZIndex();
  const { t } = useTranslate();
  const diceManager = useContext(DiceContext);

  return <>{renderPopper()}</>;

  function renderPopper() {
    return (
      <Popper
        open={props.open}
        anchorEl={props.anchorEl}
        transition
        // placement="top"
        style={{ zIndex: zIndex.diceFab }}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 16],
            },
          },
        ]}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Box
              className={css({
                padding: "0 1rem",
                maxWidth: "90vw",
                zIndex: zIndex.diceFab,
              })}
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Paper elevation={6}>
                <Box maxHeight="70vh" overflow="auto">
                  <Box p="1rem">
                    {renderCommandSetHeader("Fate")}
                    {renderOptions([
                      CommmandSetOptions["4dF"],
                      CommmandSetOptions["1dF"],
                    ])}
                    {renderCommandSetHeader("D20s")}
                    {renderOptions([
                      CommmandSetOptions["1d4"],
                      CommmandSetOptions["1d6"],
                      CommmandSetOptions["1d8"],
                      CommmandSetOptions["1d10"],
                      CommmandSetOptions["1d12"],
                      CommmandSetOptions["1d20"],
                      CommmandSetOptions["1d100"],
                    ])}
                    {renderCommandSetHeader("Misc")}
                    {renderOptions([
                      CommmandSetOptions["coin"],
                      CommmandSetOptions["card"],
                      CommmandSetOptions["2d6"],
                    ])}

                    {(props.onClear || props.onCtaClick) && (
                      <Box mt="1.5rem">
                        <Grid container justifyContent="center" spacing={2}>
                          {props.showPoolToggle && (
                            <Grid item>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      diceManager.state.options.listResults
                                    }
                                    onChange={() => {
                                      diceManager.actions.setOptions({
                                        listResults:
                                          !diceManager.state.options
                                            .listResults,
                                      });
                                    }}
                                    color="secondary"
                                  />
                                }
                                label={t("dice-fab.pool")}
                              />
                            </Grid>
                          )}
                          {props.onClear && (
                            <Grid item>
                              <Button
                                color="secondary"
                                variant="text"
                                onClick={props.onClear}
                              >
                                {"Reset"}
                              </Button>
                            </Grid>
                          )}

                          {props.onCtaClick && (
                            <Grid item>
                              <Button
                                color="secondary"
                                variant="contained"
                                onClick={props.onCtaClick}
                              >
                                {props.ctaLabel}
                              </Button>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grow>
        )}
      </Popper>
    );
  }

  function renderCommandSetHeader(header: string) {
    return (
      <Box>
        <Typography
          variant="h6"
          className={css({
            color: theme.palette.text.primary,
            textAlign: "center",
            fontWeight: theme.typography.fontWeightBold,
          })}
        >
          {header}
        </Typography>
      </Box>
    );
  }

  function renderOptions(options: Array<IDiceCommandSetOption>) {
    return (
      <>
        <Box pb=".5rem">
          <Grid container spacing={1} justifyContent="center">
            {options.map((o) => {
              const badgeContent = props.commands.reduce((acc, curr) => {
                if (o.label === curr.label) {
                  return acc + 1;
                }
                return acc;
              }, 0);
              return (
                <Grid item key={o.label}>
                  <Grid container justifyContent="center" direction="column">
                    <Grid container item justifyContent="center">
                      <IconButton
                        onClick={() => {
                          props.onDiceCommandChange((t) => {
                            return [...t, o];
                          });
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          props.onDiceCommandChange((draft) => {
                            const indexToRemove = draft.findIndex(
                              (selectedOption) =>
                                selectedOption.label === o.label
                            );
                            if (indexToRemove !== -1) {
                              draft.splice(indexToRemove, 1);
                            }
                            return [...draft];
                          });
                        }}
                        className={css({
                          background:
                            badgeContent > 0
                              ? theme.palette.action.hover
                              : "inherit",
                        })}
                        size="large"
                      >
                        <Badge badgeContent={badgeContent} color="secondary">
                          <o.icon
                            className={css({
                              fontSize: "3rem",
                              color:
                                badgeContent > 0
                                  ? theme.palette.secondary.main
                                  : theme.palette.text.secondary,
                            })}
                          />
                        </Badge>
                      </IconButton>
                    </Grid>
                    <Grid container item justifyContent="center">
                      <Typography
                        className={css({
                          fontWeight:
                            badgeContent > 0
                              ? theme.typography.fontWeightBold
                              : "inherit",
                          color:
                            badgeContent > 0
                              ? theme.palette.text.primary
                              : theme.palette.text.secondary,
                          textAlign: "center",
                        })}
                      >
                        {o.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </>
    );
  }
}
