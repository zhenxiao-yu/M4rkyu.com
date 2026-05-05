import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-4xl font-semibold tracking-normal" {...props} />,
    h2: (props) => <h2 className="mt-10 text-2xl font-semibold tracking-normal" {...props} />,
    p: (props) => <p className="my-5 leading-8 text-muted-foreground" {...props} />,
    a: (props) => <a className="text-foreground underline underline-offset-4" {...props} />,
    ...components,
  };
}
