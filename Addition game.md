# Addition Game Structure

## Levels

1. **Level 1**: Single digits 1 to 10 (10x10 matrix)
2. **Level 2**: Single digits 1 to 20 (20x20 matrix)
3. **Level 3**: Single digits 1 to 50 (50x50 matrix)
4. **Level 4**: Multi-digit addition with carry operations (separate tracking)

## Internal Score Keeping

### Matrix-Based Progress Tracking

- **Hits Matrix**: 2D array tracking successful attempts for each number combination
- **Errors Matrix**: 2D array tracking incorrect attempts for each number combination
- **Matrix Dimensions**: Based on level range (e.g., Level 1 = 10x10 for numbers 1-10)

### Problem Selection Algorithm

- Randomly select from combinations with:
  - Lowest total hits count, OR
  - Highest error count
- This ensures focused practice on weak areas

### Scoring Rules

- **Correct Answer**:
  - Increment hits_matrix\[num1]\[num2] by 1
  - If hits >= 3, decrement corresponding errors_matrix cell (minimum 0)
- **Incorrect Answer**:
  - Increment errors_matrix\[num1]\[num2] by 1
  - Decrement corresponding hits_matrix cell (minimum 0)

### Level Completion Criteria

- **Requirement**: All cells in hits_matrix must have value > 10
- **Goal**: Ensures mastery of all number combinations before advancement
- **Expected Outcome**: Over time, errors approach zero while hits grow positive

## Multi-Digit Addition (Level 4+)

### Carry Operation Reinforcement

- Implement visual "carry" operation to teach proper method
- Track progress by sum ranges rather than individual operands
- Focus on problems that require carrying (e.g., 27 + 15, 48 + 36)

### Extended Tracking

- May require different matrix structure or additional tracking mechanisms
- Consider tracking by difficulty patterns rather than simple operand pairs
