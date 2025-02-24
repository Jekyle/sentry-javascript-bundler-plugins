export interface Options {
  /**
   * The slug of the Sentry organization associated with the app.
   */
  org?: string;

  /**
   * The slug of the Sentry project associated with the app.
   *
   * This value can also be specified via the `SENTRY_PROJECT` environment variable.
   */
  project?: string;

  /**
   * The authentication token to use for all communication with Sentry.
   * Can be obtained from https://sentry.io/settings/account/api/auth-tokens/.
   * Required scopes: project:releases (and org:read if setCommits option is used).
   *
   * This value can also be specified via the `SENTRY_AUTH_TOKEN` environment variable.
   */
  authToken?: string;

  /**
   * The base URL of your Sentry instance. Use this if you are using a self-hosted
   * or Sentry instance other than sentry.io.
   *
   * This value can also be set via the `SENTRY_URL` environment variable.
   *
   * Defaults to https://sentry.io/, which is the correct value for SaaS customers.
   */
  url?: string;

  /**
   * Headers added to every outgoing network request.
   */
  headers?: Record<string, string>;

  /**
   * Print useful debug information.
   *
   * Defaults to `false`.
   */
  debug?: boolean;

  /**
   * Suppresses all logs.
   *
   * Defaults to `false`.
   */
  silent?: boolean;

  /**
   * When an error occurs during release creation or sourcemaps upload, the plugin will call this function.
   *
   * By default, the plugin will simply throw an error, thereby stopping the bundling process.
   * If an `errorHandler` callback is provided, compilation will continue, unless an error is
   * thrown in the provided callback.
   *
   * To allow compilation to continue but still emit a warning, set this option to the following:
   *
   * ```js
   * (err) => {
   *   console.warn(err);
   * }
   * ```
   */
  errorHandler?: (err: Error) => void;

  /**
   * If set to true, internal plugin errors and performance data will be sent to Sentry.
   *
   * At Sentry we like to use Sentry ourselves to deliver faster and more stable products.
   * We're very careful of what we're sending. We won't collect anything other than error
   * and high-level performance data. We will never collect your code or any details of the
   * projects in which you're using this plugin.
   *
   * Defaults to `true`.
   */
  telemetry?: boolean;

  /**
   * Completely disables all functionality of the plugin.
   *
   * Defaults to `false`.
   */
  disable?: boolean;

  /**
   * Options for source maps uploading.
   */
  sourcemaps?: {
    /**
     * A glob or an array of globs that specifies the build artifacts that should be uploaded to Sentry.
     *
     * If this option is not specified, the plugin will try to upload all JavaScript files and source map files that are created during build.
     *
     * The globbing patterns follow the implementation of the `glob` package. (https://www.npmjs.com/package/glob)
     *
     * Use the `debug` option to print information about which files end up being uploaded.
     */
    assets?: string | string[];

    /**
     * A glob or an array of globs that specifies which build artifacts should not be uploaded to Sentry.
     *
     * Default: `[]`
     *
     * The globbing patterns follow the implementation of the `glob` package. (https://www.npmjs.com/package/glob)
     *
     * Use the `debug` option to print information about which files end up being uploaded.
     */
    ignore?: string | string[];

    /**
     * Hook to rewrite the `sources` field inside the source map before being uploaded to Sentry. Does not modify the actual source map.
     *
     * Defaults to making all sources relative to `process.cwd()` while building.
     */
    rewriteSources?: (source: string, map: any) => string;

    /**
     * A glob or an array of globs that specifies the build artifacts that should be deleted after the artifact upload to Sentry has been completed.
     *
     * The globbing patterns follow the implementation of the `glob` package. (https://www.npmjs.com/package/glob)
     *
     * Use the `debug` option to print information about which files end up being deleted.
     *
     * @deprecated Use `filesToDeleteAfterUpload` instead.
     */
    // TODO(v3): Remove this option.
    deleteFilesAfterUpload?: string | string[];

    /**
     * A glob or an array of globs that specifies the build artifacts that should be deleted after the artifact upload to Sentry has been completed.
     *
     * The globbing patterns follow the implementation of the `glob` package. (https://www.npmjs.com/package/glob)
     *
     * Use the `debug` option to print information about which files end up being deleted.
     */
    filesToDeleteAfterUpload?: string | string[];
  };

  /**
   * Options related to managing the Sentry releases for a build.
   *
   * More info: https://docs.sentry.io/product/releases/
   */
  release?: {
    /**
     * Unique identifier for the release you want to create.
     *
     * This value can also be specified via the `SENTRY_RELEASE` environment variable.
     *
     * Defaults to automatically detecting a value for your environment.
     * This includes values for Cordova, Heroku, AWS CodeBuild, CircleCI, Xcode, and Gradle, and otherwise uses the git `HEAD`'s commit SHA.
     * (the latterrequires access to git CLI and for the root directory to be a valid repository)
     *
     * If you didn't provide a value and the plugin can't automatically detect one, no release will be created.
     */
    name?: string;

    /**
     * Whether the plugin should inject release information into the build for the SDK to pick it up when sending events. (recommended)
     *
     * Defaults to `true`.
     */
    inject?: boolean;

    /**
     * Whether the plugin should create a release on Sentry during the build.
     * Note that a release may still appear in Sentry even if this is value is `false` because any Sentry event that has a release value attached will automatically create a release.
     * (for example via the `inject` option)
     *
     * Defaults to `true`.
     */
    create?: boolean;

    /**
     * Whether the Sentry release should be automatically finalized (meaning an end timestamp is added) after the build ends.
     *
     * Defaults to `true`.
     */
    finalize?: boolean;

    /**
     * Unique identifier for the distribution, used to further segment your release.
     * Usually your build number.
     */
    dist?: string;

    /**
     * Version control system remote name.
     *
     * This value can also be specified via the `SENTRY_VSC_REMOTE` environment variable.
     *
     * Defaults to 'origin'.
     */
    vcsRemote?: string;

    /**
     * Associates the release with its commits in Sentry.
     */
    setCommits?: SetCommitsOptions;

    /**
     * Adds deployment information to the release in Sentry.
     */
    deploy?: DeployOptions;

    /**
     * Remove all previously uploaded artifacts for this release on Sentry before the upload.
     *
     * Defaults to `false`.
     */
    cleanArtifacts?: boolean;

    /**
     * Legacy method of uploading source maps. (not recommended unless necessary)
     *
     * One or more paths that should be scanned recursively for sources.
     *
     * Each path can be given as a string or an object with more specific options.
     *
     * The modern version of doing source maps upload is more robust and way easier to get working but has to inject a very small snippet of JavaScript into your output bundles.
     * In situations where this leads to problems (e.g subresource integrity) you can use this option as a fallback.
     */
    uploadLegacySourcemaps?: string | IncludeEntry | Array<string | IncludeEntry>;
  };

  /**
   * Options that are considered experimental and subject to change.
   *
   * @experimental API that does not follow semantic versioning and may change in any release
   */
  _experiments?: {
    /**
     * If set to true, the plugin will inject an additional `SENTRY_BUILD_INFO` variable.
     * This contains information about the build, e.g. dependencies, node version and other useful data.
     *
     * Defaults to `false`.
     */
    injectBuildInformation?: boolean;

    /**
     * Metadata associated with this module.
     *
     * The metadata is serialized and can be looked up at runtime by filename.
     *
     * Metadata can either be passed directly or alternatively a callback can be provided that will be
     * called with the following arguments:
     * - `org`: The organization slug.
     * - `project`: The project slug.
     * - `release`: The release name.
     *
     *
     * Note: This option is currently only supported by `@sentry/webpack-plugin`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    moduleMetadata?: any | ModuleMetadataCallback;
  };
}

export interface ModuleMetadataCallbackArgs {
  org?: string;
  project?: string;
  release?: string;
}

export type ModuleMetadataCallback = (args: ModuleMetadataCallbackArgs) => object;

export type IncludeEntry = {
  /**
   * One or more paths to scan for files to upload.
   */
  paths: string[];

  /**
   * One or more paths to ignore during upload.
   * Overrides entries in ignoreFile file.
   *
   * Defaults to `['node_modules']` if neither `ignoreFile` nor `ignore` is set.
   */
  ignore?: string | string[];

  /**
   * Path to a file containing list of files/directories to ignore.
   *
   * Can point to `.gitignore` or anything with the same format.
   */
  ignoreFile?: string;

  /**
   * Array of file extensions of files to be collected for the file upload.
   *
   * By default the following file extensions are processed: js, map, jsbundle and bundle.
   */
  ext?: string[];

  /**
   * URL prefix to add to the beginning of all filenames.
   * Defaults to '~/' but you might want to set this to the full URL.
   *
   * This is also useful if your files are stored in a sub folder. eg: url-prefix '~/static/js'.
   */
  urlPrefix?: string;

  /**
   * URL suffix to add to the end of all filenames.
   * Useful for appending query parameters.
   */
  urlSuffix?: string;

  /**
   * When paired with the `rewrite` option, this will remove a prefix from filename references inside of
   * sourcemaps. For instance you can use this to remove a path that is build machine specific.
   * Note that this will NOT change the names of uploaded files.
   */
  stripPrefix?: string[];

  /**
   * When paired with the `rewrite` option, this will add `~` to the `stripPrefix` array.
   *
   * Defaults to `false`.
   */
  stripCommonPrefix?: boolean;

  /**
   * Determines whether sentry-cli should attempt to link minified files with their corresponding maps.
   * By default, it will match files and maps based on name, and add a Sourcemap header to each minified file
   * for which it finds a map. Can be disabled if all minified files contain sourceMappingURL.
   *
   * Defaults to true.
   */
  sourceMapReference?: boolean;

  /**
   * Enables rewriting of matching source maps so that indexed maps are flattened and missing sources
   * are inlined if possible.
   *
   * Defaults to true
   */
  rewrite?: boolean;

  /**
   * When `true`, attempts source map validation before upload if rewriting is not enabled.
   * It will spot a variety of issues with source maps and cancel the upload if any are found.
   *
   * Defaults to `false` as this can cause false positives.
   */
  validate?: boolean;
};

type SetCommitsOptions = (AutoSetCommitsOptions | ManualSetCommitsOptions) & {
  /**
   * The commit before the beginning of this release (in other words,
   * the last commit of the previous release).
   *
   * Defaults to the last commit of the previous release in Sentry.
   *
   * If there was no previous release, the last 10 commits will be used.
   */
  previousCommit?: string;

  /**
   * If the flag is to `true` and the previous release commit was not found
   * in the repository, the plugin creates a release with the default commits
   * count instead of failing the command.
   *
   * Defaults to `false`.
   */
  ignoreMissing?: boolean;

  /**
   * If this flag is set, the setCommits step will not fail and just exit
   * silently if no new commits for a given release have been found.
   *
   * Defaults to `false`.
   */
  ignoreEmpty?: boolean;
};

type AutoSetCommitsOptions = {
  /**
   * Automatically sets `commit` and `previousCommit`. Sets `commit` to `HEAD`
   * and `previousCommit` as described in the option's documentation.
   *
   * If you set this to `true`, manually specified `commit` and `previousCommit`
   * options will be overridden. It is best to not specify them at all if you
   * set this option to `true`.
   */
  auto: true;

  repo?: undefined;
  commit?: undefined;
};

type ManualSetCommitsOptions = {
  auto?: false | undefined;

  /**
   * The full repo name as defined in Sentry.
   *
   * Required if the `auto` option is not set to `true`.
   */
  repo: string;

  /**
   * The current (last) commit in the release.
   *
   * Required if the `auto` option is not set to `true`.
   */
  commit: string;
};

type DeployOptions = {
  /**
   * Environment for this release. Values that make sense here would
   * be `production` or `staging`.
   */
  env: string;

  /**
   * Deployment start time in Unix timestamp (in seconds) or ISO 8601 format.
   */
  started?: number | string;

  /**
   * Deployment finish time in Unix timestamp (in seconds) or ISO 8601 format.
   */
  finished?: number | string;

  /**
   * Deployment duration (in seconds). Can be used instead of started and finished.
   */
  time?: number;

  /**
   * Human readable name for the deployment.
   */
  name?: string;

  /**
   * URL that points to the deployment.
   */
  url?: string;
};
