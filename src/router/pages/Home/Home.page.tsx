import { PageLayout } from "@/layouts";
import { ArrowRight } from "@tamagui/lucide-icons-2";
import { Link } from "react-router";
import { Button, H1, H2, Paragraph, Separator, Text, YStack } from "tamagui";
import { PAGES } from "..";

export function HomePage() {
  return (
    <PageLayout
      title="Spreadsheet Error Checker"
      subTitle="Review and clean your spreadsheet data before you use it elsewhere—at your own pace, with clear guidance."
    >
      <YStack self="center" pt="$4" gap="$4" maxWidth={620}>
        <H1>Welcome !</H1>

        <Paragraph color="$gray11">
          This tool helps you spot problems in messy or inconsistent data,
          understand what needs attention, and fix it with confidence.
          <br />
          You stay in control the whole way.
        </Paragraph>

        <H2>How it works</H2>
        <YStack gap="$2">
          <Paragraph>
            <Link to={PAGES.Importer.path}>
              <Text fontWeight="600">1. Upload your data:</Text>
            </Link>
            &nbsp;Start with your CSV file.
          </Paragraph>
          <Paragraph>
            <Link to={PAGES.SchemaConfigurator.path}>
              <Text fontWeight="600">2. Set the rules:</Text>
            </Link>
            &nbsp;Choose what counts as valid data for each column.
          </Paragraph>
          <Paragraph>
            <Link to={PAGES.Editor.path}>
              <Text fontWeight="600">3. Edit and fix:</Text>
            </Link>
            &nbsp;Review the table, correct values, and clear errors step by
            step.
          </Paragraph>
        </YStack>

        <H2>Your data stays private</H2>
        <Paragraph color="$gray11">
          Everything runs in your browser. Your file is not sent to a server.
          <br />
          We never see your data until you decide to share it with us.
        </Paragraph>

        <H2>You can always change your mind</H2>
        <Paragraph color="$gray11">
          Import a new file anytime, or adjust validation rules whenever you
          need to. Edits in the table can be undone with Ctrl+Z (Windows/Linux)
          or ⌘+Z (Mac).
        </Paragraph>

        <H2>No rush</H2>
        <Paragraph color="$gray11">
          You don&apos;t have to fix the whole file in one go. Your work is
          saved in this browser across refreshes and when you close the window.
          Downloading the current data as a CSV will be available soon.
        </Paragraph>

        <Separator />
        <Link
          to={PAGES.Importer.path}
          style={{ alignSelf: "end", textDecoration: "none" }}
        >
          <Button iconAfter={ArrowRight} size="$5" theme="accent">
            Get started by uploading your data
          </Button>
        </Link>
      </YStack>
    </PageLayout>
  );
}
