import { PAGES } from "@/router/pages";
import { objectEntries } from "@ubloimmo/front-util";
import { NavLink } from "react-router";
import { Paragraph, Separator, XStack } from "tamagui";
import styles from "./Nav.module.css";
import { Fragment } from "react/jsx-runtime";

const PAGE_ENTRIES = () => objectEntries(PAGES);

/**
 * Horizontal list of router links for each entry in {@link PAGES}.
 *
 * @return {JSX.Element} Navigation links
 */
export function Nav() {
  const entries = PAGE_ENTRIES();
  return (
    <XStack gap="$4" items="baseline">
      {entries.map(([name, { path, displayName }], index) => {
        return (
          <Fragment key={path}>
            <NavLink title={name} to={path} className={styles.navLink}>
              <Paragraph fontWeight="500" color="currentColor">
                {displayName}
              </Paragraph>
            </NavLink>
            {!index && <Separator vertical borderColor="$accent" />}
          </Fragment>
        );
      })}
    </XStack>
  );
}
