import { Project } from 'projen';
import { SimpleCommandStep } from '../src';

/**
 * Tests the functionality of the SimpleCommandStep class.
 * Ensures that the class correctly generates configurations for Bash scripts,
 * GitHub Actions steps, and GitLab CI steps based on provided commands.
 */
test('SimpleCommandStep works correctly', () => {

  // Create a new projen project with a specified name for testing.
  const project = new Project({ name: 'test-project' });

  // Instantiate the SimpleCommandStep with a set of test commands.
  const step = new SimpleCommandStep(project, ['echo "Hello World"', 'echo 42']);

  // Test that the Bash script configuration matches the expected snapshot.
  // This ensures the toBash method correctly processes the commands.
  expect(step.toBash()).toMatchSnapshot();

  // Test that the GitHub Actions configuration matches the expected snapshot.
  // This checks that the toGithub method maps commands to GitHub Actions steps correctly.
  expect(step.toGithub()).toMatchSnapshot();

  // Test that the GitLab CI configuration matches the expected snapshot.
  // This verifies that the toGitlab method outputs the correct configuration for GitLab pipelines.
  expect(step.toGitlab()).toMatchSnapshot();
});
