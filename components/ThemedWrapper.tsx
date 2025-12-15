import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import React, { ReactNode, cloneElement, isValidElement } from "react";

interface ThemedWrapperProps {
  children: ReactNode;
}

export function ThemedWrapper({ children }: ThemedWrapperProps) {
  const theme = useAppSelector((state) => state.theme.mode);

  // Recursively clone children and add color if they accept it
  const applyColor = (child: any): any => {
    if (!isValidElement(child)) return child;

    const childProps: any = {};
    if ("color" in (child.props as any)) {
      childProps.color = AppColor.blackWhite[theme];
    }

    // recursively apply to nested children
    const nestedChildren = React.Children.map((child.props as any).children, applyColor);

    return cloneElement(child, { ...childProps, children: nestedChildren });
  };

  return <>{React.Children.map(children, applyColor)}</>;
}