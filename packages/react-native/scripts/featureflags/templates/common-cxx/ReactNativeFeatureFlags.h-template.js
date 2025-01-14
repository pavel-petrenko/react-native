/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const {
  DO_NOT_MODIFY_COMMENT,
  getCxxTypeFromDefaultValue,
} = require('../../utils');
const signedsource = require('signedsource');

module.exports = config =>
  signedsource.signFile(`/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * ${signedsource.getSigningToken()}
 */

${DO_NOT_MODIFY_COMMENT}

#pragma once

#include <react/featureflags/ReactNativeFeatureFlagsAccessor.h>
#include <react/featureflags/ReactNativeFeatureFlagsProvider.h>
#include <memory>

namespace facebook::react {

/**
 * This class provides access to internal React Native feature flags.
 *
 * All the methods are thread-safe if you handle \`override\` correctly.
 */
class ReactNativeFeatureFlags {
 public:
${Object.entries(config.common)
  .map(
    ([flagName, flagConfig]) =>
      `  /**
   * ${flagConfig.description}
   */
  static ${getCxxTypeFromDefaultValue(flagConfig.defaultValue)} ${flagName}();`,
  )
  .join('\n\n')}

  /**
   * Overrides the feature flags with the ones provided by the given provider
   * (generally one that extends \`ReactNativeFeatureFlagsDefaults\`).
   *
   * This method must be called before you initialize the React Native runtime.
   *
   * @example
   *
   * \`\`\`
   * class MyReactNativeFeatureFlags : public ReactNativeFeatureFlagsDefaults {
   *  public:
   *   bool someFlag() override;
   * };
   *
   * ReactNativeFeatureFlags.override(
   *     std::make_unique<MyReactNativeFeatureFlags>());
   * \`\`\`
   */
  static void override(
      std::unique_ptr<ReactNativeFeatureFlagsProvider> provider);

  /**
   * Removes the overridden feature flags and makes the API return default
   * values again.
   *
   * This is **dangerous**. Use it only if you really understand the
   * implications of this method.
   *
   * This should only be called if you destroy the React Native runtime and
   * need to create a new one with different overrides. In that case,
   * call \`dangerouslyReset\` after destroying the runtime and \`override\` again
   * before initializing the new one.
   */
  static void dangerouslyReset();

 private:
  ReactNativeFeatureFlags() = delete;
  static ReactNativeFeatureFlagsAccessor& getAccessor(bool reset = false);
};

} // namespace facebook::react
`);
