import { ThemedText } from "@/components/ThemedText";
import { ThemedWrapper } from "@/components/ThemedWrapper";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { ProjectNavigationProps } from "@/routes/ProjectNavigationProps";
import { JWTStorage } from "@/secure-storage/jwt-storage";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { Link, LinkProps, router, useNavigation } from "expo-router";
import { ArrowLeft, BellIcon, DoorOpenIcon, GlobeIcon, KeyIcon, LockIcon, LucideIcon, PaintbrushIcon, ShieldIcon } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";




const settingsSections: SettingsSection[] = [
  {
    title: "Preferences",
    items: [
      { label: "App Theme", href: "./theme", Icon: PaintbrushIcon },
      { label: "Notifications", href: "./notifications", Icon: BellIcon },
      { label: "Language", href: "./language", Icon: GlobeIcon },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Privacy", href: "./privacy", Icon: ShieldIcon },
      { label: "Two-Factor Authentication", href: "/(main)/settings/two-factor-authentication", Icon: KeyIcon },
      { label: "Change Password", href: "./password", Icon: LockIcon },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Log Out", Icon: DoorOpenIcon, onClick: async function (): Promise<void> {
          await JWTStorage.removeToken();
          router.replace('/(auth)/signin');
        }
      },
    ],
  },
];


export type SettingItem = {
  label: string;
  href?: LinkProps["href"];
  Icon: LucideIcon; // or React.ElementType if multiple icons
  onClick?: (param: any) => any;
};

export type SettingsSection = {
  title: string;
  items: SettingItem[];
};



function SettingsTitle({ children }: { children: React.ReactNode }) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

function SettingsOption({ children, href, Icon, onClick }: {
  children: React.ReactNode,
  href?: LinkProps["href"],
  Icon: LucideIcon,
  onClick?: SettingItem["onClick"]
}) {
  const theme = useAppSelector(state => state.theme.mode);
  return (
    <HStack style={styles.optionCard}>
      <Icon stroke={AppColor.icons[theme]} />
      {
        href ?
          <Link href={href} style={styles.option} asChild>
            <ThemedText>
              {children}
            </ThemedText>
          </Link> :
          <ThemedText onPress={onClick} style={styles.option}>
            {children}
          </ThemedText>
      }
    </HStack>
  );
}

export default function SettingsTemplate() {
  const theme = useAppSelector(state => state.theme.mode);
  const navigator = useNavigation<ProjectNavigationProps>();
  const iconColor = AppColor.icons[theme];


  const placement = settingsSections || null;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedWrapper>
        <VStack style={styles.container}>
          <HStack style={styles.backBox}>
            <Button onPress={() => navigator.goBack()}>
              <Icon as={ArrowLeft} size="xl" stroke={iconColor} />
            </Button>
          </HStack>
          <VStack rowGap={20}>
            {settingsSections.map((section) => (
              <Box key={section.title} style={styles.singleSettingBox}>
                <SettingsTitle>{section.title}</SettingsTitle>
                <VStack style={styles.singleSettingVstack}>
                  {section.items.map((item) => (
                    <React.Fragment key={item.label}>
                      <SettingsOption

                        href={item.href}
                        onClick={item.onClick}
                        Icon={item.Icon}
                      >
                        {item.label}
                      </SettingsOption>
                    </React.Fragment>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>

        </VStack>
      </ThemedWrapper>
      <ThemeToggleButton />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 40,
  },
  container: {
  },
  backBox: {
    marginBottom: 5,
    width: "100%",
    padding: 10,
    paddingLeft: 18,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  singleSettingBox: {
    borderBottomWidth: 4,
    borderColor: "gray",
    paddingVertical: 8,
  },
  singleSettingVstack: {
    rowGap: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 25,
  },
  option: {
    fontSize: 20
  },
  optionCard: {
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    columnGap: 10,
    alignItems: "center",
    marginHorizontal: 12
  }
})